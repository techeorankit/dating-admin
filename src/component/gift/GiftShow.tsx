import React, { useEffect, useState } from "react";
import { allGiftApi, deleteGift } from "../../store/giftSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { useSelector } from "react-redux";
import { openDialog } from "@/store/dialogSlice";
import Image from "next/image";
import { warning } from "@/utils/Alert";
import { Menu, MenuItem } from "@mui/material";
import { baseURL } from "@/utils/config";
import Button from "@/extra/Button";
import image from "@/assets/images/bannerImage.png";
import emoji from "@/assets/images/emoji.jpeg";
import CommonDialog from "@/utils/CommonDialog";
import { isSkeleton } from "@/utils/allSelector";
import { usePermission } from "@/context/PermissionContext";
import TableActionIcons, {
  type TableActionIconAction,
} from "@/component/common/TableActionIcons";
import { IconEdit, IconTrash } from "@tabler/icons-react";


export default function GiftShow() {
  const dispatch = useAppDispatch();
  const { allGift } = useSelector((state: RootStore) => state.gift);
  
  const roleSkeleton = useSelector(isSkeleton);
  const [search, setSearch] = useState<string | undefined>();
  const [data, setData] = useState<any>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { can } = usePermission();
  const canCreateGift = can("Gift", "Create");

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    dispatch(allGiftApi());
  }, [dispatch]);

  useEffect(() => {
    setData(allGift);
  }, [allGift]);

  const handleDeleteGift = (item: any) => {
    // 
    const data = warning("Confirm");
    data
      .then((res) => {
        const yes = res.isConfirmed
        if (yes) {
          const payload: any = {
            giftId: item?._id,
          };
          dispatch(deleteGift(payload));
        }
      })
      .catch((err) => console.log(err));
  };

  const handleDelete = (id: any) => {
    

    setSelectedId(id);
    setShowDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      const payload: any = {
        giftId: selectedId
      }
      dispatch(deleteGift(payload));
      setShowDialog(false);
    }
  };


  const handleOpenModel = (type: any) => {
    if (type === "svga") {
      dispatch(openDialog({ type: "svgaGift" }));
    } else {
      dispatch(openDialog({ type: "imageGift" }));
    }
    setAnchorEl(null);
  };

  const handleEditGift = (item: any, giftData: any) => {

    const giftSend = {
      giftAll: item,
      giftData: giftData,
    };
    const payload: any = {
      type: item?.type === 3 ? "svgaGift" : "imageGift",
      data: giftSend,
    };

    dispatch(openDialog(payload));
  };
  return (
    <div className="giftCategoryShow">
      <div className="userTable mb-3">
        <div className="d-flex justify-content-between justify-content-sm-end align-items-center flex-wrap gap-2 w-100">
          <div
            className="flex-grow-1 d-none d-md-block"
            aria-hidden
          />
          <div className="betBox">
            {canCreateGift && (
              <Button
                className="bg-button p-10 text-white"
                bIcon={`/images/bannerImage.png`}
                text="Add Gift"
                onClick={handleClick}
              />
            )}
          </div>
        </div>
        {canCreateGift && (
          <Menu
            id="demo-customized-menu"
            MenuListProps={{
              "aria-labelledby": "demo-customized-button",
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleOpenModel("svga")} disableRipple>
              SVGA
            </MenuItem>
            <MenuItem
              onClick={() => handleOpenModel("imageGift")}
              disableRipple
            >
              Image,GIF
            </MenuItem>
          </Menu>
        )}
      </div>
      <div className="giftCategoryBox">
        <CommonDialog
          open={showDialog}
          onCancel={() => setShowDialog(false)}
          onConfirm={confirmDelete}
          text={"Delete"}
        />

        <div className="row">
          {roleSkeleton ? (
            // 🔄 Skeleton Cards
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 col-xxl-3 mb-4"
              >
                <div
                  className="p-4 text-center"
                  style={{
                    backgroundColor: "#f9f9ff",
                    borderRadius: "16px",
                    width: "100%",
                  }}
                >
                  {/* Circular Image */}
                  <div
                    className="skeleton mx-auto mb-3"
                    style={{
                      height: "100px",
                      width: "100px",
                      borderRadius: "50%",
                    }}
                  ></div>

                  {/* Coin Label */}
                  <div
                    className="skeleton mx-auto mb-3"
                    style={{
                      height: "20px",
                      width: "80px",
                      borderRadius: "4px",
                    }}
                  ></div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-center gap-2">
                    {[1, 2].map((_, btnIndex) => (
                      <div
                        key={btnIndex}
                        className="skeleton"
                        style={{
                          height: "32px",
                          width: "32px",
                          borderRadius: "8px",
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : data?.length > 0 ? (
            // ✅ Actual Data Rendering
            data.map((category: any, categoryIndex: number) => {
              if (!category?.gifts?.length) return null;
              return (
                <div key={category._id} className="col-12">
                  <h4 style={{ marginBottom: "10px", display: "flex", justifyContent: "start", fontWeight: "500" }}>
                    {category.categoryName ||
                      (category?.gifts?.[0]?.giftCategory?.name ?? "")}
                  </h4>
                  <div className="row">
                    {category.gifts.map((item: any, index: number) => (
                      <div
                        key={item._id}
                        className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 col-xxl-3"
                        style={{ marginBottom: "0px" }}
                      >
                        <div className="giftCategory">
                          <div className="giftCategory-img">
                            <img
                              src={
                                baseURL +
                                (item.type === 3
                                  ? item.svgaImage?.replace(/\\/g, "/")
                                  : item.image?.replace(/\\/g, "/"))
                              }
                              className="img-gift"
                              width={50}
                              height={50}
                              alt="Image"
                              style={{
                                objectFit: "cover",
                                padding: "0px",
                              }}
                              onError={(e: any) => {
                                e.target.error = null;
                                e.target.src = `/images/emoji.jpeg`;
                              }}
                            />
                            <h5 style={{ margin: "20px 0px", fontWeight: "400" }} className="d-flex align-items-center justify-content-center gap-2">
                              <span>{item?.coin}</span>
                              <img src="/images/coin.webp" alt="Coin" height={22} width={22} />
                            </h5>
                            <div className="action-button">
                              {(() => {
                                const actions: Array<
                                  TableActionIconAction | undefined
                                > = [
                                  can("Gift", "Edit")
                                    ? {
                                        id: "edit",
                                        label: "Edit",
                                        icon: IconEdit,
                                        color: "#0EA5E9",
                                        onClick: () =>
                                          handleEditGift(item, category),
                                      }
                                    : undefined,
                                  can("Gift", "Delete")
                                    ? {
                                        id: "delete",
                                        label: "Delete",
                                        icon: IconTrash,
                                        color: "#EF4444",
                                        onClick: () =>
                                          handleDelete(item?._id),
                                      }
                                    : undefined,
                                ];

                                return (
                                  <TableActionIcons
                                    size={22}
                                    gap={8}
                                    actions={actions.filter(
                                      (
                                        action
                                      ): action is TableActionIconAction =>
                                        action !== undefined
                                    )}
                                  />
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // ❌ No Data Fallback
            <div
              className="d-flex justify-content-center align-items-center text-center"
              style={{ minHeight: "60vh", fontSize: "16px" }}
            >
              No Data Found
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
