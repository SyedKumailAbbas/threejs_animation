"use client"; // Ensure this line is at the top

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const ThreeCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const mousePosition = useRef(new THREE.Vector2(0, 0));
  const targetMousePosition = useRef(new THREE.Vector2(0, 0)); // For smooth transition
  const [isInRightSection, setIsInRightSection] = useState(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current?.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);

    // White smoke background shader
    const smokeFragmentShader = `
      uniform vec2 u_resolution;
      uniform float u_time;

      float noise(vec2 p) {
          return sin(p.x * 10.0 + u_time * 5.0) * 0.5 + 0.5;
      }

      void main() {
          vec2 st = gl_FragCoord.xy / u_resolution;
          float n = noise(st + vec2(0.0, u_time)); // Add some dynamic noise

          // Define smoke color
          vec3 color = vec3(1.0, 1.0, 1.0) * n; // White smoke
          gl_FragColor = vec4(color, 1.0);
      }
    `;

    const smokeShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_time: { value: 0.0 },
      },
      fragmentShader: smokeFragmentShader,
    });

    const smokePlane = new THREE.Mesh(geometry, smokeShaderMaterial);
    scene.add(smokePlane);

    // Main pink animation shader with vignette effect
    const fragmentShaderPink = `
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform bool u_isInRightSection;
      uniform float u_time;

      float fluctuation(float x, float time) {
          return 0.1 * sin(10.0 * (x + time * 0.5)); // Adjust parameters for fluid movement
      }

      void main() {
          vec2 st = gl_FragCoord.xy / u_resolution;
          float middleFade = smoothstep(0.35, 0.65, st.x);

          float dist = length(st - u_mouse);

          float size = 0.5;
          float startDistance = length(st - vec2(0.0, 1.0));
          float fluctuationEffect = fluctuation(st.y, u_time);

          float intensity = smoothstep(startDistance + fluctuationEffect, startDistance - size, dist);

          // Main pink color gradient
          vec3 color = mix(vec3(1.0, 0.92, 0.98), vec3(0.8, 0.2, 0.67), intensity * middleFade);

          // Vignette effect
          float vignette = smoothstep(0.6, 1.0, length(st - vec2(0.5, 0.5)));
          color = mix(color, vec3(1.0), vignette); // Mix with white based on vignette

          gl_FragColor = vec4(color, 1.0);
      }
    `;

    const shaderMaterialPink = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mouse: { value: mousePosition.current },
        u_isInRightSection: { value: isInRightSection },
        u_time: { value: 0.0 },
      },
      fragmentShader: fragmentShaderPink,
    });

    const mainPlanePink = new THREE.Mesh(geometry, shaderMaterialPink);
    scene.add(mainPlanePink);

    // Main sky blue animation shader with vignette effect
    const fragmentShaderBlue = `
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform bool u_isInRightSection;
      uniform float u_time;

      float fluctuation(float x, float time) {
          return 0.5 * sin(10.0 * (x + time * 1.5)); // Adjust parameters for fluid movement
      }

      void main() {
          vec2 st = gl_FragCoord.xy / u_resolution;
          float middleFade = smoothstep(0, 0, st.x);

          float dist = length(st - u_mouse + 5);

          float size = 0.5;
          float startDistance = length(st - vec2(0.0, 1.0));
          float fluctuationEffect = fluctuation(st.y, u_time);

          float intensity = smoothstep(startDistance + fluctuationEffect, startDistance - size, dist);

          // Main sky blue color gradient
          vec3 color = mix(vec3(0.7, 0.9, 1.0), vec3(0.1, 0.5, 1.0), intensity * middleFade); // Sky blue gradient

          // Vignette effect
          float vignette = smoothstep(0.6, 1.0, length(st - vec2(0.5, 0.5)));
          color = mix(color, vec3(1.0), vignette); // Mix with white based on vignette

          gl_FragColor = vec4(color, 1.0);
      }
    `;

    const shaderMaterialBlue = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mouse: { value: mousePosition.current },
        u_isInRightSection: { value: isInRightSection },
        u_time: { value: 0.0 },
      },
      fragmentShader: fragmentShaderBlue,
    });

    const mainPlaneBlue = new THREE.Mesh(geometry, shaderMaterialBlue);
    mainPlaneBlue.position.set(1000, 1000, 0.5); // Very far position
    scene.add(mainPlaneBlue);

    // Peach wave animation shader
    const fragmentShaderPeachWave = `
      uniform vec2 u_resolution;
      uniform float u_time;

      void main() {
          vec2 st = gl_FragCoord.xy / u_resolution;

          // Create a wave effect using a sine function
          float wave = sin(st.y * 10.0 + u_time * 5.0) * 0.1; // Wave effect

          // Adjust the position for visibility
          st.y += wave; // Modify y-coordinate for wave movement

          // Define peach color
          vec3 color = vec3(1.0, 0.8, 0.7); // Peach color
          gl_FragColor = vec4(color, 0.9); // Increase opacity to make it more visible
      }
    `;

    const peachWaveMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_time: { value: 0.0 },
      },
      fragmentShader: fragmentShaderPeachWave,
    });

    const peachWavePlane = new THREE.Mesh(geometry, peachWaveMaterial);
    peachWavePlane.position.set(-1, -1, -0.5); // Position it to the bottom left corner
    peachWavePlane.scale.set(2.5, 2.5, 1); // Scale the plane for better coverage
    scene.add(peachWavePlane);

    const animate = () => {
      smokeShaderMaterial.uniforms.u_time.value += 0.01;
      shaderMaterialPink.uniforms.u_time.value += 0.01;
      shaderMaterialBlue.uniforms.u_time.value += 0.01;
      peachWaveMaterial.uniforms.u_time.value += 0.01; // Animate peach wave

      // Update mouse position with smooth transition
      mousePosition.current.lerp(targetMousePosition.current, 0.1); // Adjust the factor for delay
      shaderMaterialPink.uniforms.u_mouse.value.copy(mousePosition.current);
      shaderMaterialBlue.uniforms.u_mouse.value.copy(mousePosition.current);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Update mouse position
    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = event.clientX;

      // const isMouseInRightSection = mouseX > window.innerWidth / 2;
      const isMouseInRightSection = true;

      setIsInRightSection(isMouseInRightSection);

      if (isMouseInRightSection) {
        targetMousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1; // Normalize x
        targetMousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1; // Normalize y
      }
    };
   

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default ThreeCanvas;
