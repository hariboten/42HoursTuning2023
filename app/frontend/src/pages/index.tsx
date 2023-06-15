import dynamic from "next/dynamic";

const TopPage = dynamic(() => import("../component/Users/Users"), {
  ssr: false,
});

export default TopPage;
