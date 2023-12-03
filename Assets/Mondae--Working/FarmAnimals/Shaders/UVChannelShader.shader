Shader "FarmAnimals/UVChannelShader"
{
    Properties
    {
        _Color ("Color", Color) = (1,1,1,1)
        _MainTex ("Albedo (RGB)", 2D) = "white" {}
        _Glossiness ("Smoothness", Range(0,1)) = 0.5
        _Metallic ("Metallic", Range(0,1)) = 0.0
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" }
        LOD 200

        CGPROGRAM
        #pragma surface surf Standard fullforwardshadows
        #pragma target 3.0

        #pragma shader_feature UV0
        #pragma shader_feature UV1
        #pragma shader_feature UV2
        #pragma shader_feature UV3

        sampler2D _MainTex;

        struct Input
        {
            #if UV3
            float2 uv4_MainTex;
            #elif UV2
            float2 uv3_MainTex;
            #elif UV1
            float2 uv2_MainTex;
            #else
            float2 uv_MainTex;
            #endif
        };

        half _Glossiness;
        half _Metallic;
        fixed4 _Color;

        UNITY_INSTANCING_BUFFER_START(Props)
        UNITY_INSTANCING_BUFFER_END(Props)

        float2 getUv(Input IN) {
            #if UV3
            return IN.uv4_MainTex;
            #elif UV2
            return IN.uv3_MainTex;
            #elif UV1
            return IN.uv2_MainTex;
            #else
            return IN.uv_MainTex;
            #endif
        }

        void surf (Input IN, inout SurfaceOutputStandard o)
        {
            fixed4 c = tex2D (_MainTex, getUv(IN)) * _Color;
            o.Albedo = c.rgb;
            o.Metallic = _Metallic;
            o.Smoothness = _Glossiness;
            o.Alpha = c.a;
        }
        ENDCG
    }

    FallBack "Diffuse"
    CustomEditor "PolygonAnimalShaderEditor"
}
