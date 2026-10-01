import RootLayout from "@/component/layout/Layout";
import React from "react";

const NotAuthorized = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="text-center">
        <h2 className="mb-3">Not Authorized</h2>
        <p className="text-muted">
          You do not have permission to view this page.
        </p>
      </div>
    </div>
  );
};

NotAuthorized.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default NotAuthorized;

