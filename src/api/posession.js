import { ReleasePO } from "./ApiServices";
import Toast from "react-native-toast-message";
let currentPO = null;
let lockedByUser = false;

export const setCurrentPO = (poId, isLockedByUser) => {
  currentPO = poId;
  lockedByUser = isLockedByUser;
};

export const clearCurrentPO = () => {
  currentPO = null;
  lockedByUser = false;
};

// 🔓 Release PO
export async function releasecurrentPO(poId) {
  if (!poId) return;
      try {
        const release = await ReleasePO(poId);
        if(release){
        clearCurrentPO();
        }else{
          Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to Release PO. Please try again.',
          position: 'top',
          visibilityTime: 5000,
        });
        }
      } catch(error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: `${error}`,
          position: 'top',
          visibilityTime: 5000,
        });
      }
}

export const getCurrentPO = () => ({ currentPO, lockedByUser });

