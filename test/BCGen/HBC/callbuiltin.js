// RUN: %hermesc -O -fstatic-builtins -target=HBC -dump-ra %s | %FileCheck --match-full-lines --check-prefix=CHKRA %s
// RUN: %hermesc -O -fstatic-builtins -target=HBC -dump-bytecode %s | %FileCheck --match-full-lines --check-prefix=CHKBC %s
// RUN: %hermes -O -fstatic-builtins -target=HBC %s | %FileCheck --match-full-lines %s

function foo(x) {
    return Object.keys(x)
}

//CHKRA-LABEL:function foo(x)
//CHKRA-NEXT:frame = []
//CHKRA-NEXT:%BB0:
//CHKRA-NEXT:{{.*}} %0 = HBCLoadParamInst 1 : number
//CHKRA-NEXT:{{.*}} %1 = HBCCallBuiltinInst [Object.keys] : number, undefined : undefined, %0
//CHKRA-NEXT:{{.*}} %2 = ReturnInst %1
//CHKRA-NEXT:function_end

//CHKBC-LABEL:Function<foo>(2 params, 9 registers, 0 symbols):
//CHKBC-NEXT: Offset{{.*}}
//CHKBC-NEXT:    LoadParam         r1, 1
//CHKBC-NEXT:    CallBuiltin       r0, 40, 2
//CHKBC-NEXT:    Ret               r0

// Make sure that this isn't incorrectly recognized as a builtin.
function shadows() {
    var Object = {keys: print};
    Object.keys("evil");
}

//CHKRA-LABEL:function shadows() : undefined
//CHKRA-NEXT:frame = []
//CHKRA-NEXT:%BB0:
//CHKRA-NEXT:  {{.*}} %0 = AllocObjectInst 1 : number
//CHKRA-NEXT:  {{.*}} %1 = HBCGetGlobalObjectInst
//CHKRA-NEXT:  {{.*}} %2 = TryLoadGlobalPropertyInst %1 : object, "print" : string
//CHKRA-NEXT:  {{.*}} %3 = StoreNewOwnPropertyInst %2, %0 : object, "keys" : string, true : boolean
//CHKRA-NEXT:  {{.*}} %4 = LoadPropertyInst %0 : object, "keys" : string
//CHKRA-NEXT:  {{.*}} %5 = HBCLoadConstInst "evil" : string
//CHKRA-NEXT:  {{.*}} %6 = CallInst %4, %0 : object, %5 : string
//CHKRA-NEXT:  {{.*}} %7 = HBCLoadConstInst undefined : undefined
//CHKRA-NEXT:  {{.*}} %8 = ReturnInst %7 : undefined
//CHKRA-NEXT:function_end

print(foo({a: 10, b: 20, lastKey:30, 5:6}))
//CHECK: 5,a,b,lastKey
