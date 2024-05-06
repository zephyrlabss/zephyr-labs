//banner canvas wave animation
function BannerAnim() {
  "use strict";
  var vertex = `
          attribute vec2 uv;
          attribute vec2 position;
          varying vec2 vUv;
          void main() {
                  vUv = uv;
                  gl_Position = vec4(position, 0, 1);
          }`;
  var fragment = `
          precision highp float;
          precision highp int;
          uniform sampler2D tWater;
          uniform sampler2D tFlow;
          uniform float uTime;
          varying vec2 vUv;
          uniform vec4 res;
          uniform vec2 img;
          uniform vec2 u_textureFactor;
          vec2 centeredAspectRatio(vec2 uvs, vec2 factor){
                  return uvs * factor - factor /2. + 0.5;
          }
          void main() {
              vec3 flow = texture2D(tFlow, vUv).rgb;
              vec2 uv = .5 * gl_FragCoord.xy / res.xy ;
              vec2 myUV = (uv - vec2(0.5))*res.zw + vec2(0.5);
              myUV -= flow.xy * (0.15 * 1.2);
              vec3 tex = texture2D(tWater, myUV).rgb;
              gl_FragColor = vec4(tex, 1.0);
          }`;
  const init = () => {
    var _size = [window.innerWidth, window.innerHeight];
    document.body.style.minHeight = "100vh";
    const content = document.getElementById("bg_parent");
    var renderer = new ogl.Renderer({ dpr: 2 });
    var gl = renderer.gl;
    content.appendChild(gl.canvas);
    var aspect = 1;
    var mouse = new ogl.Vec2(-1);
    var velocity = new ogl.Vec2();
    function resize() {
      gl.canvas.width = window.innerWidth * 2.0;
      gl.canvas.height = window.innerHeight * 2.0;
      gl.canvas.style.width = window.innerWidth + "px";
      gl.canvas.style.height = window.innerHeight + "px";
      var a1, a2;
      var imageAspect = _size[1] / _size[0];
      if (window.innerHeight / window.innerWidth < imageAspect) {
        a1 = 1;
        a2 = window.innerHeight / window.innerWidth / imageAspect;
      } else {
        a1 = (window.innerWidth / window.innerHeight) * imageAspect;
        a2 = 1;
      }
      mesh.program.uniforms.res.value = new ogl.Vec4(
        window.innerWidth,
        window.innerHeight,
        a1,
        a2
      );
      renderer.setSize(window.innerWidth, window.innerHeight);
      aspect = window.innerWidth / window.innerHeight;
    }
    var flowmap = new ogl.Flowmap(gl, {
      falloff: 0.2,
      dissipation: 0.92,
      alpha: 0.5,
    });
    var geometry = new ogl.Geometry(gl, {
      position: {
        size: 2,
        data: new Float32Array([-1, -1, 3, -1, -1, 3]),
      },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    });
    var texture = new ogl.Texture(gl, {
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    });
    var img = new Image();
    img.onload = () => (texture.image = img);
    img.crossOrigin = "Anonymous";
    img.src = content.querySelector("img").src;
    content.querySelector("img").remove();
    var a1, a2;
    var imageAspect = _size[1] / _size[0];
    if (window.innerHeight / window.innerWidth < imageAspect) {
      a1 = 1;
      a2 = window.innerHeight / window.innerWidth / imageAspect;
    } else {
      a1 = (window.innerWidth / window.innerHeight) * imageAspect;
      a2 = 1;
    }
    const factors = texture;
    var program = new ogl.Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        tWater: { value: texture },
        res: {
          value: new ogl.Vec4(window.innerWidth, window.innerHeight, a1, a2),
        },
        img: { value: new ogl.Vec2(_size[1], _size[0]) },
        tFlow: flowmap.uniform,
        u_textureFactor: { type: "v2", value: factors[0] },
      },
    });
    var mesh = new ogl.Mesh(gl, { geometry, program });
    window.addEventListener("resize", resize, false);
    resize();
    var isTouchCapable = "ontouchstart" in window;
    if (isTouchCapable) {
      window.addEventListener("touchstart", updateMouse, false);
      window.addEventListener("touchmove", updateMouse, { passive: false });
    } else {
      window.addEventListener("mousemove", updateMouse, false);
    }
    var lastTime;
    var lastMouse = new ogl.Vec2();
    function updateMouse(e) {
      e.preventDefault();
      if (e.changedTouches && e.changedTouches.length) {
        e.x = e.changedTouches[0].pageX;
        e.y = e.changedTouches[0].pageY;
      }
      if (e.x === undefined) {
        e.x = e.pageX;
        e.y = e.pageY;
      }
      mouse.set(e.x / gl.renderer.width, 1.0 - e.y / gl.renderer.height);
      if (!lastTime) {
        lastTime = performance.now();
        lastMouse.set(e.x, e.y);
      }
      var deltaX = e.x - lastMouse.x;
      var deltaY = e.y - lastMouse.y;
      lastMouse.set(e.x, e.y);
      var time = performance.now();
      var delta = Math.max(10.4, time - lastTime);
      lastTime = time;
      velocity.x = deltaX / delta;
      velocity.y = deltaY / delta;
      velocity.needsUpdate = true;
    }
    requestAnimationFrame(update);
    function update(t) {
      requestAnimationFrame(update);
      if (!velocity.needsUpdate) {
        mouse.set(-1);
        velocity.set(0);
      }
      velocity.needsUpdate = false;
      flowmap.aspect = aspect;
      flowmap.mouse.copy(mouse);
      flowmap.velocity.lerp(velocity, velocity.len ? 0.25 : 0.01);
      flowmap.update();
      program.uniforms.uTime.value = t * 0.5;
      renderer.render({ scene: mesh });
    }
  };
  init();
}
window.addEventListener("DOMContentLoaded", function(){
  if(window.innerWidth>991){
    BannerAnim();
  }
});
