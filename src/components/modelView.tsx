import { useEffect, useRef } from "react";
import {
  AmbientLight,
  Color,
  EquirectangularReflectionMapping,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls, PLYLoader } from "three/examples/jsm/Addons.js";

export interface PLYData {
  data: Blob | null;
}

function ModelView({ data }: PLYData) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scene setup
    const scene = new Scene();
    const camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    ); +
    // Position the camera (e.g., move it along the +Z axis)
    camera.position.set(0.9, 1.8, -2.3); // Places camera at (0,0,5)

    // Ensure the camera is looking towards the origin (which is along -Z)
    camera.lookAt(0.9, 1.8, 2.3);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    sceneRef.current!.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth motion
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 1;

    // Floor
    // const floorGeometry = new PlaneGeometry(1000, 1000);
    // const floorMaterial = new MeshStandardMaterial({
    //   color: 0xfeeeee,
    //   side: DoubleSide,
    // });
    // const floor = new Mesh(floorGeometry, floorMaterial);
    // floor.rotation.x = -Math.PI / 2;
    // floor.receiveShadow = true;
    // scene.add(floor);

    // Load OBJ Model
    renderer.shadowMap.enabled = true;
    const loader = new PLYLoader();
    if (data != null) {
      // Create an object URL from the Blob
      const url = URL.createObjectURL(data);
      loader.load(
        url,
        (geometry) => {
          geometry.computeVertexNormals(); // Compute smooth shading
          const material = new MeshStandardMaterial({
            color: 0xffffee,
            metalness: 0.5, // Reflectivity
            roughness: 0.3,
          });
          const mesh = new Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.position.set(0, 1, 0);
          mesh.rotateZ(Math.PI);
          scene.add(mesh);
        },
        console.log,
        (err) => console.error(err)
      );
    }

    // Light
    const light = new PointLight(0xffffff, 5, 10);
    light.position.set(0, 3, 0);
    light.castShadow = true;
    scene.add(light);

    const light2 = new PointLight(0xffffff, 5, 10);
    light2.position.set(2, 3, 2);
    light2.castShadow = true;
    scene.add(light2);

    const light3 = new PointLight(0xffffff, 5, 10);
    light3.position.set(-2, 3, -2);
    light3.castShadow = true;
    scene.add(light3);

    scene.background = new Color(0xffeaeeee);

    const loader2 = new TextureLoader();
    loader2.load("skybox.png", (texture) => {
      texture.mapping = EquirectangularReflectionMapping; // Set equirectangular mapping
      scene.background = texture; // Set as background of the scene
    });

    const ambient = new AmbientLight(0xffffff, 0.2);
    scene.add(ambient);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      // camera.position.add(new Vector3(0, 0, -0.01))
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function to remove event listeners and dispose of Three.js objects
    return () => {
      sceneRef.current!.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [data]);

  return <div ref={sceneRef} className="w-full h-full absolute z-0" />;
}

export default ModelView;
