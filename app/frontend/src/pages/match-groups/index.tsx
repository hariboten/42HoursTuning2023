import dynamic from "next/dynamic";

const MatchGroupsPage = dynamic(
  () => import("../../component/MatchGroups/MatchGroups"),
  {
    ssr: false,
  }
);

export default MatchGroupsPage;
