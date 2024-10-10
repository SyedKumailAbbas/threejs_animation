"use client"; // Ensure this line is at the top

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const ThreeCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const mousePosition = useRef(new THREE.Vector2(0, 0));
  const targetMousePosition = useRef(new THREE.Vector2(0, 0)); // For smooth transition

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current?.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2); // Plane covers the full screen

    // Peach background shader for the right side
    const fragmentShaderPeach = `
      uniform vec2 u_resolution;

      void main() {
          vec2 st = gl_FragCoord.xy / u_resolution;

          // Only apply the peach color to the right half of the screen
          if (st.x > 0.5) {
              vec3 peachColor = vec3(1.0, 0.8, 0.7); // Peach color
              gl_FragColor = vec4(peachColor, 1.0);
          } else {
              discard; // Discard fragments on the left side
          }
      }
    `;

    const peachShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      fragmentShader: fragmentShaderPeach,
      transparent: true,
    });

    const peachPlane = new THREE.Mesh(geometry, peachShaderMaterial);
    peachPlane.position.set(0, 0, 0); // Position the peach plane at the back
    scene.add(peachPlane);

    // Main pink animation shader with gradient and vignette effect
    const fragmentShaderPink = `
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
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

          // Define gradient colors for pink
          vec3 lightPink = vec3(1.0, 0.6, 0.8); // Light pink color
          vec3 darkPink = vec3(0.8, 0.2, 0.67); // Dark pink color
          vec3 pinkGradient = mix(lightPink, darkPink, st.y); // Gradient from light to dark pink

          // Define blue color for the edges
          vec3 blueColor = vec3(0.3, 0.5, 1.0);

          // Apply a blue tint only at the edges where the intensity is low
          float edgeFactor = smoothstep(0.0, 0.5, intensity);
          vec3 color = mix(blueColor, pinkGradient, edgeFactor); // Blend blue and pink gradient at the edges

          // Apply the intensity to the blended color to mix with the gradient
          vec3 baseColor = vec3(1.0, 0.92, 0.98);
          color = mix(baseColor, color, intensity);

          // Vignette effect - keep it white
          float vignette = smoothstep(0.8, 1.0, length(st - vec2(0.5, 0.5)));
          color = mix(color, vec3(1.0), vignette); // Mix with white for the vignette effect

          gl_FragColor = vec4(color, 1.0);
      }
    `;

    const shaderMaterialPink = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mouse: { value: mousePosition.current },
        u_time: { value: 0.0 },
      },
      fragmentShader: fragmentShaderPink,
      transparent: true,
    });

    const mainPlanePink = new THREE.Mesh(geometry, shaderMaterialPink);
    mainPlanePink.position.set(0, 0, 0.1); // Position on top of the peach plane
    scene.add(mainPlanePink);

    const animate = () => {
      shaderMaterialPink.uniforms.u_time.value += 0.01;

      // Update mouse position with smooth transition
      mousePosition.current.lerp(targetMousePosition.current, 0.1); // Adjust the factor for delay
      shaderMaterialPink.uniforms.u_mouse.value.copy(mousePosition.current);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Update mouse position
    const handleMouseMove = (event: MouseEvent) => {
      targetMousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1; // Normalize x
      targetMousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1; // Normalize y
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Handle window resize
    window.addEventListener("resize", () => {
      camera.left = -1;
      camera.right = 1;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      peachShaderMaterial.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
      shaderMaterialPink.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default ThreeCanvas;
