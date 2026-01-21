import Logo from "@/components/logo";
import AdminProfile from "./admin-profile";

const DashboardNavbar = () => {
  return (
    <header className="zuimi-bg-gradient sticky top-0">
      <div className="flex mx-auto justify-between items-center w-full max-w-500 px-5 ">
        <Logo />
        <AdminProfile />
      </div>
    </header>
  );
};

export default DashboardNavbar;
