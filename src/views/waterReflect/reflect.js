export const vs =
  "attribute vec3 position;" +
  "attribute vec2 st;" +
  "uniform mat4 u_modelViewMatrix;" +
  "uniform mat4 u_invWorldViewMatrix;" +
  //'uniform vec2 u_texCoordOffset;' +
  //'uniform vec2 u_texCoordScale;' +
  //'uniform float u_frameTime;' +
  "uniform int u_clampToGroud;" +
  "uniform vec3 u_camPos;" +
  "uniform vec3 u_scale;" +
  //'varying vec3 eyeDir;' +
  "varying vec3 vToEye;" +
  //'varying vec2 texCoord;' +
  "varying vec2 vUv;" +
  //'varying float myTime;' +
  //'varying vec4 projectionCoord;' +
  "varying vec4 vCoord;" +
  "void main(void)" +
  "{" +
  //gl_Position = ftransform();
  "vec4 positionW = u_modelViewMatrix * vec4(position.xyz, 1.0);" +
  "vec4 eyep = czm_modelView * positionW;" +
  "gl_Position = czm_projection * eyep; " +
  "if (u_clampToGroud == 1)" +
  "{" +
  //'eyeDir = (u_camPos - position.xyz) * u_scale;' +vToEye
  "vToEye = (u_camPos - position.xyz) * u_scale;" +
  "} else {" +
  "vec4 pos = u_modelViewMatrix * vec4(position.xyz,1.0);" +
  //'eyeDir = vec3(u_invWorldViewMatrix*vec4(pos.xyz,0.0));' +
  "vToEye = vec3(u_invWorldViewMatrix*vec4(pos.xyz,0.0));" +
  //'projectionCoord = gl_Position;' +
  "vCoord = gl_Position;" +
  "}" +
  //'texCoord = (st+u_texCoordOffset)*u_texCoordScale;' +
  //'vUv = (st+u_texCoordOffset)*u_texCoordScale;' +
  "vUv = st;" +
  //'myTime = 0.01 * u_frameTime;' +
  "}";

export const fs = [
  "uniform sampler2D tReflectionMap;",
  "uniform sampler2D tRefractionMap;",
  "uniform sampler2D tNormalMap0;",
  "uniform sampler2D tNormalMap1;",
  "uniform sampler2D tFlowMap;",

  "uniform vec3 color;",
  "uniform float reflectivity;",
  "uniform vec4 config;",

  "varying vec4 vCoord;",
  "varying vec2 vUv;",
  "varying vec3 vToEye;",

  "void main() {",
  "	float flowMapOffset0 = config.x;",
  "	float flowMapOffset1 = config.y;",
  "	float halfCycle = config.z;",
  "	float scale = config.w;",

  "	vec3 toEye = normalize( vToEye );",

  // determine flow direction
  "	vec2 flow;",
  //'	#ifdef USE_FLOWMAP',
  //'		flow = texture2D( tFlowMap, vUv ).rg * 2.0 - 1.0;',
  "		flow = texture2D( tFlowMap, vUv ).rg;",
  //'	#else',
  //'		flow = flowDirection;',
  //'	#endif',
  //'	flow.x *= - 1.0;',

  // sample normal maps (distort uvs with flowdata)
  "	vec4 normalColor0 = texture2D( tNormalMap0, ( vUv * scale ) + flow * flowMapOffset0 );",
  "	vec4 normalColor1 = texture2D( tNormalMap1, ( vUv * scale ) + flow * flowMapOffset1 );",

  "	float flowLerp = abs( halfCycle - flowMapOffset0 ) / halfCycle;",
  "	vec4 normalColor = mix( normalColor0, normalColor1, flowLerp );",

  "	vec3 normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );",

  // calculate the fresnel term to blend reflection and refraction maps
  "	float theta = max( dot( toEye, normal ), 0.0 );",
  "	float reflectance = reflectivity + ( 1.0 - reflectivity ) * pow( ( 1.0 - theta ), 5.0 );",

  // calculate final uv coords
  "	vec3 coord = vCoord.xyz / vCoord.w;",
  "   vec2 coord1 = gl_FragCoord.xy / czm_viewport.zw;",
  "	vec2 uv = coord1.xy + coord.z * normal.xz * 0.05;",

  "	vec4 reflectColor = texture2D( tReflectionMap, vec2( 1.0 - uv.x, uv.y ) );",
  "	vec4 refractColor = texture2D( tRefractionMap, uv );",

  "	gl_FragColor = vec4( color, 1.0 ) * mix( refractColor, reflectColor, reflectance );",
  "gl_FragColor = refractColor;",
  "}",
].join("\n");
