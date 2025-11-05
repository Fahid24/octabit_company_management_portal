import { useIsMobile } from "../../../hook/useIsMobile";
import { Bottombar } from "./Bottombar";
import { Sidebar } from "./Sidebar";
import { navLinks } from "../../constant/navLinks";


export function ResponsiveNavigation() {
  const isMobile = useIsMobile();

  return <>{isMobile ? <Bottombar /> : <Sidebar />}</>;
}
