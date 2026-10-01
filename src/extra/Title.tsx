import { useRouter } from "next/router";

export default function Title(props: any) {
  const navigate = useRouter();
  const { name, display, bottom, description } = props;
  const normalizedName = (name || "").toString().replace(/\s+/g, " ").trim();
  const descriptionTarget = normalizedName
    .replace(/\b(table|list|page)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const autoDescription = descriptionTarget
    ? `Manage ${descriptionTarget.toLowerCase()} details and related actions.`
    : "";
  const subtitle = description ?? autoDescription;

  const handleDashboardClick = () => {
    navigate.push("/dashboard");
  };
  return (
    <>
      <div
        className=" d-flex align-items-center justify-content-between cursor-pointer"
        style={{ marginBottom: bottom  }}
      >
        <div
          className=" text-capitalize dashboardclass"
          style={{ color: "#404040" , fontWeight:"400" }}
        >
          {name}
          {subtitle && (
            <div
              style={{
                marginTop: "4px",
                fontSize: "13px",
                color: "#6b7280",
                fontWeight: 400,
                textTransform: "none",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        
      </div>
    </>
  );
}
