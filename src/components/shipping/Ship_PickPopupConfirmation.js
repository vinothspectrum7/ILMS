import React from 'react';
import { Modal } from 'react-native';
import Ship_ConfirmModalComponent from '../../components/shipping/Ship_ConfirmModalComponent';

function Ship_PickPopupConfirmation({ visible, onClose, onManual, onYes, deliveryId }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Ship_ConfirmModalComponent
        visible={visible}
        title=""
        message={`Would you like to proceed express pick and pack for delivery ID ${deliveryId}?`}
        confirmAction={onYes}
        onCancel={onManual}
        onClose={onClose}
      />
    </Modal>
  );
}

export default Ship_PickPopupConfirmation;
