import { Providers } from "@/Provider";
import LanguageSetupPrompt from "@/component/language/LanguageSetupPrompt";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const RootLayout = ({ children }) => {
  return (
    
    <div className="">
      <Providers>
      <LanguageSetupPrompt />
      <div className="mainAdminGrid">
        <Sidebar />
        <div className={`mainAdmin`}>
          <Navbar />
          <main className="comShow">{children}</main>
        </div>
      </div>
      </Providers>
    </div>

  );
};

export default RootLayout;  
