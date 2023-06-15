import dynamic from "next/dynamic";

const LoginPage = dynamic(() => import("../../component/Login/Login"), {
  ssr: false,
});

export default LoginPage;
