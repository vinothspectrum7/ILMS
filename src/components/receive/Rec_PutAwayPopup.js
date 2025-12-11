import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";

import DropdownIcon from "../../assets/icons/dropdown.svg";
import PassedIcon from "../../assets/icons/passed.svg";
import CustomNumericInput from '../../components/CustomNumericInput';

const Rec_PutAwayPopup = ({ 
  visible, 
  onClose, 
  lineLabel, 
  lineQty,
  lineId, 
    onPutAwayComplete 
}) => {
  const [putAwayQuantity, setPutAwayQuantity] = useState(0);
  const maxQuantity = 100;

   const handleCompletePutAway = () => {
    
    if (onPutAwayComplete) {
      onPutAwayComplete(lineId); 
    }
    
    onClose();
  };
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "transparent",
        }}
      >
        <View
          style={{
            width: "100%",
            height: 123,
            backgroundColor: "transparent",
          }}
        />

        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            overflow: "hidden",
          }}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                width: "100%",
                height: 43,
                backgroundColor: "#ECF1F7",
                paddingHorizontal: 16,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#233E55" }}>
                Put Away - Line {lineLabel}
              </Text>

              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#233E55" />
              </TouchableOpacity>
            </View>

            <View
              style={{
                width: "90%",
                height: 70,
                backgroundColor: "#EFFFF4",
                borderWidth: 1.3,
                borderColor: "#73B386",
                borderRadius: 10,
                alignSelf: "center",
                marginTop: 25,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 15,
              }}
            >
              <PassedIcon width={26} height={26} />

              <View style={{ marginLeft: 10 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#168035",
                  }}
                >
                  Passed Inspection
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#000",
                    }}
                  >
                    {lineQty}
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      color: "#7A7C80",
                      marginLeft: 4,
                    }}
                  >
                    Units
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                width: "90%",
                marginTop: 30,
                alignSelf: "center",
                borderWidth: 1,
                borderColor: "#EFEFF0",
                borderRadius: 8,
                backgroundColor: "#FFFFFF",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: 37,
                  backgroundColor: "#ECF1F7",
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  justifyContent: "center",
                  paddingLeft: 12,
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 14,
                    color: "#5D768B",
                  }}
                >
                  Storage Location
                </Text>
              </View>

              <View style={{ padding: 12 }}>
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 12,
                    color: "#233E55",
                    marginBottom: 4,
                  }}
                >
                  Sub-Inventory*
                </Text>

                <View
                  style={{
                    width: "100%",
                    height: 38,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#EFEFF0",
                    backgroundColor: "#FFFFFF",
                    paddingHorizontal: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 15,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#000" }}>
                    Select sub inventory
                  </Text>
                  <DropdownIcon width={18} height={18} />
                </View>

                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 12,
                    color: "#233E55",
                    marginBottom: 4,
                  }}
                >
                  Target Locator*
                </Text>

                <View
                  style={{
                    width: "100%",
                    height: 38,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#EFEFF0",
                    backgroundColor: "#FFFFFF",
                    paddingHorizontal: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 15,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#000" }}>
                    Select locator
                  </Text>
                  <DropdownIcon width={18} height={18} />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 12,
                      color: "#233E55",
                    }}
                  >
                    Put-Away Quantity*
                  </Text>

                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 10,
                      color: "#233E55",
                    }}
                  >
                    Max: 100 units
                  </Text>
                </View>

                <View
                  style={{
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <CustomNumericInput
                    value={putAwayQuantity}
                    setValue={setPutAwayQuantity}
                    min={0}
                    max={maxQuantity}
                    step={1}
                    width={150}
                    height={38}
                    isSelected={putAwayQuantity > 0}
                    disabledinput={false}
                  />
                </View>
              </View>
            </View>
            <View
              style={{
                width: "90%",
                marginTop: 25,
                alignSelf: "center",
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: 25,
                  backgroundColor: "#5D768B",
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  justifyContent: "center",
                  paddingHorizontal: 10,
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 12,
                    color: "#FFFFFF",
                  }}
                >
                  Summary
                </Text>
              </View>
              <View
                style={{
                  width: "100%",
                  backgroundColor: "#F5F5F6",
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  shadowColor: "#00000040",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 1,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#233E55" }}>Item</Text>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>
                    Item 4
                  </Text>
                </View>

                <View
                  style={{
                    width: "100%",
                    height: 0,
                    borderWidth: 0.5,
                    borderColor: "#CCCED2",
                    marginBottom: 12,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#233E55" }}>From</Text>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>
                    Quality Control
                  </Text>
                </View>

                <View
                  style={{
                    width: "100%",
                    height: 0,
                    borderWidth: 0.5,
                    borderColor: "#CCCED2",
                    marginBottom: 12,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#233E55" }}>To</Text>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>
                    Main Warehouse - A-01-01
                  </Text>
                </View>

                <View
                  style={{
                    width: "100%",
                    height: 0,
                    borderWidth: 0.5,
                    borderColor: "#CCCED2",
                    marginBottom: 12,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#233E55" }}>Quantity</Text>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#000" }}>
                    {lineQty} Each
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={{
                width: "90%",
                height: 35,
                backgroundColor: "#5D768B",
                borderRadius: 8,
                alignSelf: "center",
                marginTop: 20,
                marginBottom: 30,
                justifyContent: "center",
                alignItems: "center",
              }}
                onPress={handleCompletePutAway} 
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Complete Put Away
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default Rec_PutAwayPopup;