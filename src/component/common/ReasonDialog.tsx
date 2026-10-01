import Button from "@/extra/Button";
import { closeDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { useSelector } from "react-redux";

const ReasonDialog = () => {
  const dispatch = useAppDispatch();
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);

  const reasonText: string =
    dialogueData?.reason ??
    dialogueData?.data?.reason ??
    dialogueData?.rejectReason ??
    "";

  return (
    <div className="dialog">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-4 col-md-5 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h4 className="text-theme m0">Reason</h4>
                </div>
                <div className="col-4">
                  <div
                    className="closeButton"
                    onClick={() => dispatch(closeDialog())}
                    style={{ fontSize: "20px" }}
                  >
                    ✖
                  </div>
                </div>
              </div>

              <div className="row align-items-start formBody">
                <div className="col-12">
                  <p
                    className="m0 text-capitalize"
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      minHeight: "80px",
                    }}
                  >
                    {reasonText ? reasonText : "-"}
                  </p>
                </div>

                <div className="mt-4 d-flex justify-content-end">
                  
                  <Button
                    className={`cancelButton text-white`}
                    text={`Cancel`}
                    type={`button`}
                    onClick={() => dispatch(closeDialog())}
                    
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReasonDialog;

