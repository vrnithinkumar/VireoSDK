/**

Copyright (c) 2018 National Instruments Corp.

This software is subject to the terms described in the LICENSE.TXT file

SDG
*/

/*! \file
\brief Functions to call user defined JavaScript functions
*/

#include "TypeDefiner.h"
#include "ExecutionContext.h"
#include "StringUtilities.h"
#include "TDCodecVia.h"
#include <stdio.h>

#if defined (VIREO_TYPE_JavaScriptInvoke)
namespace Vireo {

#if kVireoOS_emscripten
extern "C" {
    // JavaScript function prototypes
    // Parameters: functionName, returnValue, parameters*, parametersCount, errorCheckingEnabled, errorStatus*, errorCode*, errorSource*
    extern void jsJavaScriptInvoke(StringRef, void *, void *, Int32, Boolean, Boolean *, Int32 *, StringRef);
}
#endif

//------------------------------------------------------------
//! Return parameter type name for the given element(index) in the parameters array
VIREO_EXPORT const char* JavaScriptInvoke_GetParameterType(StaticTypeAndData *parameters, Int32 index)
{
    TypeRef parameterType = parameters[index]._paramType;
    static StringRef returnBuffer = null;
    if (returnBuffer == null) {
        // Allocate a string the first time it is used.
        // After that it will be resized as needed.
        STACK_VAR(String, tempReturn);
        returnBuffer = tempReturn.DetachValue();
    } else {
        returnBuffer->Resize1D(0);
    }

    if (returnBuffer) {
        SubString typeName = parameterType->Name();
        returnBuffer->Append(typeName.Length(), (Utf8Char*)typeName.Begin());
        // Add an explicit null terminator so it looks like a C string.
        returnBuffer->Append((Utf8Char)'\0');
        return (const char*)returnBuffer->Begin();
    }
    return "";
}

//------------------------------------------------------------
//! Return parameter pointer for the given element(index) in the parameters array
VIREO_EXPORT void* JavaScriptInvoke_GetParameterPointer(StaticTypeAndData *parameters, Int32 index)
{
    void *pData = parameters[index]._pData;
    TypeRef parameterType = parameters[index]._paramType;
    if (parameterType->IsString()) {
        // We a have pointer to a StringRef, we just need the StringRef.
        // So we can use functions that already work with StringRef on the JavaScript side.
        pData = *(StringRef*)pData;
    }
    return pData;
}

//------------------------------------------------------------
// arguments: errorCheckingEnabled, errorCluster, functionName, returnValue, then variable number of inputs that can be null or any type
struct JavaScriptInvokeParamBlock : public VarArgInstruction
{
    _ParamDef(Boolean, errorCheckingEnabled);
    _ParamDef(ErrorCluster, errorCluster);
    _ParamDef(StringRef, functionName);
    _ParamImmediateDef(StaticTypeAndData, returnValue[1]);
    _ParamImmediateDef(StaticTypeAndData, parameters[1]);
    NEXT_INSTRUCTION_METHODV()
};

extern void AddCallChainToSourceIfErrorPresent(ErrorCluster *errorCluster, ConstCStr methodName);
extern void GenerateNotSupportedOnPlatformError(ErrorCluster *errorCluster, ConstCStr methodName);

//------------------------------------------------------------
// Function for calling user defined JavaScript functions
VIREO_FUNCTION_SIGNATUREV(JavaScriptInvoke, JavaScriptInvokeParamBlock)
{
    ErrorCluster *errorClusterPtr = _ParamPointer(errorCluster);
#if kVireoOS_emscripten
    StringRef functionName = _Param(functionName);
    Boolean errorCheckingEnabled = _Param(errorCheckingEnabled);
    const Int32 configurationParameters = 3;  // errorCheckingEnabled, errorCluster and functionName
    const Int32 staticTypeAndDataParameters = 2;  // Two parameters are inserted, one for type another for data. See StaticTypeAndData definition.
    Int32 userParametersCount = (_ParamVarArgCount() - configurationParameters - staticTypeAndDataParameters) / staticTypeAndDataParameters;
    StaticTypeAndData *returnValuePtr = _ParamImmediate(returnValue);
    StaticTypeAndData *parametersPtr = _ParamImmediate(parameters);

    if (!errorClusterPtr->status) {
        jsJavaScriptInvoke(
            functionName,
            returnValuePtr,
            parametersPtr,
            userParametersCount,
            errorCheckingEnabled,
            &errorClusterPtr->status,
            &errorClusterPtr->code,
            errorClusterPtr->source);
        AddCallChainToSourceIfErrorPresent(errorClusterPtr, "JavaScriptInvoke");
    }
#else
    GenerateNotSupportedOnPlatformError(errorClusterPtr, "JavaScriptInvoke");
#endif
    return _NextInstruction();
}

//------------------------------------------------------------
DEFINE_VIREO_BEGIN(JavaScriptInvoke)
    DEFINE_VIREO_FUNCTION(JavaScriptInvoke, "p(i(VarArgCount argumentCount) i(Boolean errorCheckingEnabled) io(ErrorCluster errorCluster)"
        "i(String functionName) o(StaticTypeAndData returnValue) io(StaticTypeAndData functionParameters))")
DEFINE_VIREO_END()

}  // namespace Vireo
#endif  // VIREO_TYPE_JavaScriptInvoke
