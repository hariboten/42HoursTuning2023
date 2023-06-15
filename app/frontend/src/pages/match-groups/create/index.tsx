import dynamic from "next/dynamic";

const CreateMatchGroupsPage = dynamic(
  () => import("../../../component/MatchGroups/CreateMatchGroup"),
  {
    ssr: false,
  }
);

export default CreateMatchGroupsPage;
