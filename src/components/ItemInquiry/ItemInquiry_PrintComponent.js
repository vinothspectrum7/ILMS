import React from 'react';
import RNPrint from 'react-native-print';
import { Alert } from 'react-native';

const ItemInquiryPrintComponent = {

    printItemInquiry: async (itemData, activeTab, selectedOrganization) => {
        if (!itemData) {
            Alert.alert('Error', 'No item data to print');
            return;
        }

        try {
            const html = ItemInquiryPrintComponent.generateHtmlContent(
                itemData,
                activeTab,
                selectedOrganization
            );

            await RNPrint.print({
                html: html,
                jobName: `Item_Inquiry_${itemData.itemHeader.itemCode}_${activeTab}_${new Date().getTime()}`
            });
        } catch (error) {
            console.error('Print error:', error);
            Alert.alert('Print Error', 'Failed to generate print preview');
        }
    },

    getTabSpecificContent: (itemData, activeTab) => {
        switch (activeTab) {
            case 'Stock':
                return ItemInquiryPrintComponent.generateStockTabContent(itemData);

            case 'Organization':
                return ItemInquiryPrintComponent.generateOrgTabContent(itemData);

            case 'Details':
                return ItemInquiryPrintComponent.generateDetailsTabContent(itemData);

            case 'Transactions':
                return ItemInquiryPrintComponent.generateTransactionsTabContent(itemData);

            case 'Overview':
                return ItemInquiryPrintComponent.generateOverviewTabContent(itemData);

            default:
                return '<div class="no-data">No data available for this tab</div>';
        }
    },

    generateStockTabContent: (itemData) => {
        const stockSummary = itemData.overview?.stockSummary || {};
        const stockStatus = itemData.overview?.stockStatus || {};

        return `
      <div class="stock-tab-section">
        <!-- Stock Summary -->
        <div class="section-header">
          <span class="section-header-text">Stock Summary</span>
        </div>
        <div class="divider"></div>
        
        <div class="stock-container">
          <div class="stock-row">
            <span class="stock-label">Total On Hand</span>
            <span class="stock-value" style="color: #168035">${stockSummary.totalOnHand || 'N/A'}</span>
          </div>
          <div class="stock-row">
            <span class="stock-label">Available</span>
            <span class="stock-value" style="color: #033EFF">${stockSummary.available || 'N/A'}</span>
          </div>
          <div class="stock-row">
            <span class="stock-label">Reserved</span>
            <span class="stock-value" style="color: #DA1E28">${stockSummary.reserved || 'N/A'}</span>
          </div>
          <div class="stock-row">
            <span class="stock-label">Allocated</span>
            <span class="stock-value" style="color: #603F8B">${stockSummary.allocated || 'N/A'}</span>
          </div>
          <div class="stock-row">
            <span class="stock-label">In Transit</span>
            <span class="stock-value" style="color: #033EFF">${stockSummary.inTransit || 'N/A'}</span>
          </div>
          <div class="stock-row">
            <span class="stock-label">On Order</span>
            <span class="stock-value" style="color: #168035">${stockSummary.onOrder || 'N/A'}</span>
          </div>
        </div>
        
        <!-- Stock Status -->
        <div class="section-header">
          <span class="section-header-text">Stock Status</span>
        </div>
        <div class="divider"></div>
        
        <div class="current-stock-container">
          <div class="current-stock-header">
            <span class="current-stock-label">Current Stock</span>
            <span class="current-stock-value">${stockStatus.currentStock || 'N/A'}/${stockStatus.maxStock || 'N/A'}</span>
          </div>
          
          <div class="progress-bar-container">
            <div class="progress-bar-background">
              <div class="progress-bar-fill" style="width: ${(stockStatus.currentStock / stockStatus.maxStock) * 100 || 0}%"></div>
            </div>
          </div>
          
          <div class="stock-metrics-row">
            <div class="metric-container">
              <span class="metric-label">Min</span>
              <span class="metric-value">: ${stockStatus.minStock || 'N/A'}</span>
            </div>
            <div class="metric-container">
              <span class="metric-label">Reorder</span>
              <span class="metric-value">: ${stockStatus.reorderPoint || 'N/A'}</span>
            </div>
            <div class="metric-container">
              <span class="metric-label">Max</span>
              <span class="metric-value">: ${stockStatus.maxStock || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <!-- Status Cards -->
        <div class="status-cards-row">
          <div class="in-transit-card">
            <div class="in-transit-value">${stockStatus.inTransit || 'N/A'}</div>
            <div class="in-transit-label">In Transit</div>
          </div>
          
          <div class="on-order-card">
            <div class="on-order-value">${stockStatus.onOrder || 'N/A'}</div>
            <div class="on-order-label">On Order</div>
          </div>
        </div>
      </div>
    `;
    },

    generateOrgTabContent: (itemData) => {
        const orgData = itemData?.organization || (itemData.overview ? {
            desc: itemData.overview.organizationInfo?.desc || 'No description available',
            organizations: [{
                organizationName: itemData.overview.organizationInfo?.organizationName || 'N/A',
                orgCode: itemData.overview.organizationInfo?.code || 'N/A',
                status: ['Primary', 'Active'],
                attributes: [
                    itemData.overview.organizationAttributes?.purchasable || 'Purchasable',
                    itemData.overview.organizationAttributes?.stockable || 'Stockable',
                    itemData.overview.organizationAttributes?.transactable || 'Transactable',
                    itemData.overview.organizationAttributes?.serialControlled || 'Serial Controlled',
                    itemData.overview.organizationAttributes?.lotControlled || 'Lot Controlled'
                ].filter(Boolean),
                leadTime: itemData.overview.organizationAttributes?.leadTime || 'N/A',
                safetyStock: itemData.overview.planningParameters?.safetyStock || 'N/A',
                minQuantity: itemData.overview.planningParameters?.minOrderQuantity || 'N/A',
                maxQuantity: itemData.overview.planningParameters?.maxOrderQuantity || 'N/A',
                viewDetails: true
            }]
        } : {
            desc: 'No organization data available',
            organizations: []
        });

        const description = orgData.desc || itemData.overview?.organizationInfo?.desc || '';

        return `
      <div class="org-tab-section">
        <!-- Item Assignments Card -->
        <div class="assignments-container">
          <div class="assignments-title">Item Assignments</div>
          <div class="org-description">${description}</div>
        </div>

        ${orgData.organizations.map((org, index) => `
          <div class="org-card-wrapper">
            <div class="org-card">
              <div class="org-header">
                <div class="org-info">
                  <div class="org-name">${org.organizationName}</div>
                </div>
                <div class="status-container">
                  ${Array.isArray(org.status) ? org.status.map((statusItem, i) => `
                    <div class="status-badge ${statusItem === 'Primary' ? 'primary-badge' : 'active-badge'}">
                      ${statusItem}
                    </div>
                  `).join('') : `
                    <div class="status-badge ${org.status === 'Primary' ? 'primary-badge' : 'active-badge'}">
                      ${org.status}
                    </div>
                  `}
                </div>
              </div>

              <div class="attributes-container">
                ${org.attributes.map((attr, i) => `
                  <div class="attribute-badge">
                    <span class="tick-symbol">✓</span>
                    <span class="attribute-text">${attr}</span>
                  </div>
                `).join('')}
              </div>

              <div class="details-row">
                <div class="detail-item">
                  <span class="detail-label">Lead Time: </span>
                  <span class="detail-value">${org.leadTime}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Safety Stock: </span>
                  <span class="detail-value">${org.safetyStock}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Min / Max: </span>
                  <span class="detail-value">${org.minQuantity}/${org.maxQuantity}</span>
                </div>
              </div>
            </div>

            ${org.viewDetails ? `
              <div class="card-footer">
                <div class="view-details-row">
                  <span class="view-details-text">View Details</span>
                </div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
    },

    generateDetailsTabContent: (itemData) => {
        const itemDetails = itemData?.itemdetails || {};

        if (!itemDetails.itemCode) {
            return `
        <div class="details-tab-section">
          <div class="no-data">No item details available</div>
        </div>
      `;
        }

        return `
      <div class="details-tab-section">
        <div class="details-card">
          <div class="details-header">
            <span class="details-header-text">Item Details</span>
          </div>

          <div class="details-container">
            <div class="details-row">
              <div class="details-column">
                <span class="details-label">Item Code</span>
                <span class="details-value">${itemDetails.itemCode || 'N/A'}</span>
              </div>

              <div class="details-column">
                <span class="details-label">UOM</span>
                <span class="details-value">${itemDetails.uom || 'N/A'}</span>
              </div>
            </div>

            <div class="details-row">
              <div class="details-column">
                <span class="details-label">Category</span>
                <span class="details-value">${itemDetails.category || 'N/A'}</span>
              </div>

              <div class="details-column">
                <span class="details-label">Description</span>
                <span class="details-value" style="max-height: 28px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                  ${itemDetails.description || 'N/A'}
                </span>
              </div>
            </div>

            <div class="details-row">
              <div class="details-column">
                <span class="details-label">Status</span>
                <span class="details-value">${itemDetails.Status || 'N/A'}</span>
              </div>

              <div class="details-column">
                <span class="details-label">Last Updated</span>
                <span class="details-value">${itemDetails.lastUpdated || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    generateTransactionsTabContent: (itemData) => {
        const transactions = itemData?.transactions?.recentTransactions || [];

        if (transactions.length === 0) {
            return `
        <div class="transactions-section">
          <div class="no-transactions">
            No transaction data available
          </div>
        </div>
      `;
        }

        const getStatusStyle = (status) => {
            switch (status) {
                case 'Receipt':
                    return { backgroundColor: '#D3FFE0', color: '#168035' };
                case 'Issue':
                    return { backgroundColor: '#FFF5F4', color: '#DA1E28' };
                case 'Adjustment':
                    return { backgroundColor: '#FFF9F4', color: '#F06000' };
                case 'Transfer':
                    return { backgroundColor: '#F4F9FF', color: '#145DA0' };
                default:
                    return { backgroundColor: '#E0E0E0', color: '#595A5C' };
            }
        };

        const getTransactionIcon = (transactionType) => {
            switch (transactionType) {
                case 'PO Receipt':
                    return '📥';
                case 'Sales Order Issue':
                    return '📤';
                case 'Sub-Inventory Transfer':
                    return '🔄';
                case 'Cycle Count Adjustment':
                    return '📊';
                default:
                    return '📝';
            }
        };

        return `
      <div class="transactions-section">
        <div class="section-header">
          <span class="section-header-text">Recent Transactions</span>
        </div>
        <div class="divider"></div>
        
        <div class="transactions-container">
          ${transactions.map((transaction) => {
            const statusStyle = getStatusStyle(transaction.status);
            const icon = getTransactionIcon(transaction.transactionType);
            const quantityColor = transaction.quantity >= 0 ? '#168035' : '#DA1E28';
            const quantityText = transaction.quantity >= 0 ? `+${transaction.quantity}` : transaction.quantity;

            return `
              <div class="transaction-card">
                <div class="transaction-top-row">
                  <div class="transaction-left-section">
                    <div class="icon-wrapper">
                      <span class="transaction-icon">${icon}</span>
                    </div>
                    <span class="transaction-type">${transaction.transactionType || 'N/A'}</span>
                  </div>
                  
                  <span class="transaction-quantity" style="color: ${quantityColor}">
                    ${quantityText}
                  </span>
                </div>

                <div class="transaction-middle-row">
                  <div class="org-section">
                    <span class="organization-code">${transaction.organizationCode || 'N/A'}</span>
                  </div>
                  
                  <div class="status-badge" style="background-color: ${statusStyle.backgroundColor}">
                    <span class="status-text" style="color: ${statusStyle.color}">
                      ${transaction.status || 'N/A'}
                    </span>
                  </div>
                </div>

                <div class="transaction-divider"></div>

                <div class="transaction-bottom-row">
                  <div class="date-section">
                    <span class="label">Date</span>
                    <span class="date-value">${transaction.transactionDate || 'N/A'}</span>
                  </div>

                  <div class="location-section">
                    <span class="label">Location</span>
                    <span class="location-value">${transaction.location || 'N/A'}</span>
                  </div>
                </div>
              </div>
            `;
        }).join('')}
        </div>
      </div>
    `;
    },

    generateOverviewTabContent: (itemData) => {
        const overview = itemData.overview || {};

        return `
      <div class="overview-section">
        <!-- Organization Info -->
        <div class="overview-card">
          <div class="viewing-row">
            <span class="viewing-text">Viewing for Organization</span>
          </div>
          
          <div class="org-details">
            <div class="org-name">${overview.organizationInfo?.organizationName || 'N/A'}</div>
            <div class="org-desc">${overview.organizationInfo?.desc || 'N/A'}</div>
          </div>
        </div>
        
        <div class="section-header">
          <span class="section-header-text">Item Information</span>
        </div>
        <div class="divider"></div>
        
        <div class="details-grid">
          <div class="details-row">
            <div class="details-cell">
              <div class="details-label">Item Class</div>
              <div class="details-value">${overview.itemInformation?.itemClass || 'N/A'}</div>
            </div>
            <div class="details-cell">
              <div class="details-label">Item Type</div>
              <div class="details-value">${overview.itemInformation?.itemType || 'N/A'}</div>
            </div>
            <div class="details-cell">
              <div class="details-label">Unit of Measure</div>
              <div class="details-value">${overview.itemInformation?.unitOfMeasure || 'N/A'}</div>
            </div>
          </div>
          
          <div class="details-row">
            <div class="details-cell">
              <div class="details-label">Secondary UOM</div>
              <div class="details-value">${overview.itemInformation?.secondaryUOM || 'N/A'}</div>
            </div>
            <div class="details-cell">
              <div class="details-label">Version/Revision</div>
              <div class="details-value">${overview.itemInformation?.revision || 'N/A'}</div>
            </div>
            <div class="details-cell">
              <div class="details-label">Created By / Date</div>
              <div class="created-info">
                <div class="created-by">${overview.itemInformation?.createdBy || 'N/A'}</div>
                <div class="created-date">${overview.itemInformation?.createdDate || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section-header">
          <span class="section-header-text">Organization Attributes</span>
        </div>
        <div class="divider"></div>
        
        <div class="attributes-grid">
          <div class="attributes-row">
            <div class="attribute-capsule" style="background-color: #E8F5E9;">
              <span class="attribute-text">${overview.organizationAttributes?.purchasable || 'N/A'}</span>
            </div>
            <div class="attribute-capsule" style="background-color: #E8F5E9;">
              <span class="attribute-text">${overview.organizationAttributes?.stockable || 'N/A'}</span>
            </div>
          </div>
          
          <div class="attributes-row">
            <div class="attribute-capsule" style="background-color: #E8F5E9;">
              <span class="attribute-text">${overview.organizationAttributes?.transactable || 'N/A'}</span>
            </div>
            <div class="attribute-capsule" style="background-color: #EEF6FF;">
              <span class="attribute-text" style="color: #033EFF">${overview.organizationAttributes?.serialControlled || 'N/A'}</span>
            </div>
          </div>
          
          <div class="attributes-row">
            <div class="attribute-capsule" style="background-color: #E9D8FF;">
              <span class="attribute-text">${overview.organizationAttributes?.lotControlled || 'N/A'}</span>
            </div>
            <div class="attribute-capsule" style="background-color: #ECF1F7;">
              <span class="attribute-text">${overview.organizationAttributes?.leadTime || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    },

    generateHtmlContent: (itemData, activeTab, selectedOrganization) => {
        const tabContent = ItemInquiryPrintComponent.getTabSpecificContent(itemData, activeTab);

        return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          ${ItemInquiryPrintComponent.getCssStyles()}
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            <div class="print-title">Item Inquiry Report - ${activeTab} Tab</div>
            <div class="print-subtitle">Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          
          <div class="content-container">
            <div class="item-header">
              <div class="header-row">
                <div class="icon-wrapper">
                  <div class="icon-box">📦</div>
                </div>
                
                <div class="content-wrapper">
                  <div class="top-row">
                    <div class="item-name">${itemData.itemHeader.itemName}</div>
                    <div class="status-badge">
                      <span class="status-text">${itemData.itemHeader.status}</span>
                    </div>
                  </div>
                  
                  <div class="sku-text">${itemData.itemHeader.sku}</div>
                  
                  <div class="attributes-row">
                    ${itemData.itemHeader.attributes.map(attr => {
            let bgColor = '#329AFB';
            if (attr === 'Lot') bgColor = '#0055D5';
            else if (attr === 'Serial') bgColor = '#C767FF';
            else if (attr === 'Electronic') bgColor = '#329AFB';
            return `<div class="attribute-badge" style="background-color: ${bgColor}">${attr}</div>`;
        }).join('')}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="org-dropdown">
              <div class="org-text">
                ${selectedOrganization?.name || 'Select Organization'} ${selectedOrganization?.code ? `(${selectedOrganization.code})` : ''}
              </div>
            </div>
            
            ${tabContent}
          </div>
          
          <div class="print-footer">
            <div>Printed from Item Inquiry System | Item Code: ${itemData.itemHeader.itemCode} | ${activeTab} Tab</div>
          </div>
        </div>
      </body>
    </html>
    `;
    },

    getCssStyles: () => `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Mulish', Arial, sans-serif;
      color: #242424;
      background-color: white;
      line-height: 1.4;
      width: 100%;
      padding: 0;
      margin: 0;
      font-size: 12px;
    }
    
    .print-container {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
      background-color: white;
    }
    
    .print-header {
      width: 100%;
      text-align: center;
      padding: 15px 0;
      border-bottom: 2px solid #233E55;
      margin-bottom: 20px;
    }
    
    .print-title {
      font-size: 16px;
      font-weight: 700;
      color: #233E55;
      margin-bottom: 4px;
    }
    
    .print-subtitle {
      font-size: 11px;
      color: #666;
    }
    
    .content-container {
      width: 100%;
      padding: 0 15px;
    }
    
    .item-header {
      background-color: #145DA0;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 15px;
      width: 100%;
    }
    
    .header-row {
      display: flex;
      align-items: center;
      width: 100%;
    }
    
    .icon-wrapper {
      min-width: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 10px;
    }
    
    .icon-box {
      width: 35px;
      height: 35px;
      background-color: rgba(255,255,255,0.2);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
    }
    
    .content-wrapper {
      flex: 1;
      min-width: 0;
    }
    
    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      width: 100%;
    }
    
    .item-name {
      font-size: 12px;
      font-weight: 700;
      color: white;
      flex: 1;
      min-width: 0;
      margin-right: 8px;
    }
    
    .status-badge {
      background-color: #15D54D;
      padding: 4px 8px;
      border-radius: 4px;
      flex-shrink: 0;
    }
    
    .status-text {
      color: white;
      font-size: 11px;
      font-weight: 600;
    }
    
    .sku-text {
      font-size: 10px;
      font-weight: 700;
      color: white;
      opacity: 0.9;
      margin-bottom: 8px;
    }
    
    .attributes-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      width: 100%;
    }
    
    .attribute-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
    }
    
    .org-dropdown {
      background-color: #F3F8FF;
      border: 1px solid #ECF1F7;
      border-radius: 4px;
      padding: 10px 12px;
      margin-bottom: 20px;
      width: 100%;
    }
    
    .org-text {
      font-size: 12px;
      color: #242424;
      font-weight: 600;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      padding: 12px 0 6px 0;
      background-color: white;
      width: 100%;
    }
    
    .section-header-text {
      font-size: 14px;
      font-weight: 700;
      color: #233E55;
    }
    
    .divider {
      height: 1px;
      background-color: #233E55;
      border-bottom: 1px solid #9D9FA3;
      width: 100%;
      margin-bottom: 12px;
    }
    
    .stock-container {
      width: 100%;
      min-height: auto;
      border-radius: 8px;
      border: 1px solid #D5DFFF;
      background-color: #F4F9FF;
      overflow: hidden;
      margin-bottom: 20px;
    }
    
    .stock-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      border-bottom: 1px solid #E0E0E0;
    }
    
    .stock-row:last-child {
      border-bottom: none;
    }
    
    .stock-label {
      font-size: 12px;
      font-weight: 600;
      color: #242424;
    }
    
    .stock-value {
      font-size: 14px;
      font-weight: 700;
    }
    
    .current-stock-container {
      width: 100%;
      min-height: auto;
      border-radius: 10px;
      background-color: #F0FDF4;
      padding: 12px;
      margin-bottom: 16px;
    }
    
    .current-stock-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      width: 100%;
    }
    
    .current-stock-label {
      font-size: 12px;
      font-weight: 600;
      color: #168035;
    }
    
    .current-stock-value {
      font-size: 14px;
      font-weight: 700;
      color: #168035;
    }
    
    .progress-bar-container {
      width: 100%;
      margin-bottom: 10px;
    }
    
    .progress-bar-background {
      width: 100%;
      height: 8px;
      border-radius: 8px;
      background-color: #D0E6D7;
      overflow: hidden;
    }
    
    .progress-bar-fill {
      height: 100%;
      background-color: #168035;
      border-radius: 8px;
    }
    
    .stock-metrics-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
    
    .metric-container {
      display: flex;
      align-items: center;
    }
    
    .metric-label {
      font-size: 10px;
      font-weight: 700;
      color: #595A5C;
    }
    
    .metric-value {
      font-size: 10px;
      font-weight: 700;
      color: #595A5C;
    }
    
    .status-cards-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      gap: 12px;
    }
    
    .in-transit-card, .on-order-card {
      flex: 1;
      min-height: 50px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 12px;
    }
    
    .in-transit-card {
      background-color: #E2E8FF;
    }
    
    .on-order-card {
      background-color: #F4F9FF;
    }
    
    .in-transit-value, .on-order-value {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .in-transit-value {
      color: #033EFF;
    }
    
    .on-order-value {
      color: #168035;
    }
    
    .in-transit-label, .on-order-label {
      font-size: 12px;
      font-weight: 600;
      color: #242424;
    }
    
    .org-tab-section {
      width: 100%;
      padding-bottom: 20px;
    }
    
    .assignments-container {
      width: 100%;
      min-height: auto;
      border-radius: 8px;
      border: 1px solid #D5DFFF;
      background-color: #E5F6FF;
      padding: 12px;
      margin-bottom: 16px;
    }
    
    .assignments-title {
      font-size: 12px;
      font-weight: 700;
      color: #233E55;
      margin-bottom: 4px;
    }
    
    .org-description {
      font-size: 12px;
      font-weight: 400;
      color: #242424;
      line-height: 1.3;
    }
    
    .org-card-wrapper {
      width: 100%;
      border-radius: 8px;
      border: 0.5px solid #D9E4EE;
      margin-bottom: 12px;
      overflow: hidden;
    }
    
    .org-card {
      width: 100%;
      background-color: #FFFFFF;
      padding: 12px;
    }
    
    .org-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    
    .org-info {
      flex: 1;
    }
    
    .org-name {
      font-size: 12px;
      font-weight: 700;
      color: #242424;
      margin-bottom: 2px;
    }
    
    .org-code {
      font-size: 10px;
      font-weight: 600;
      color: #595A5C;
    }
    
    .status-container {
      display: flex;
      margin-left: 8px;
      gap: 4px;
    }
    
    .primary-badge {
      background-color: #145DA0;
    }
    
    .active-badge {
      background-color: #15D54D;
    }
    
    .attributes-container {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 12px;
      gap: 6px;
    }
    
    .tick-symbol {
      font-size: 10px;
      color: #168035;
    }
    
    .attribute-text {
      font-size: 10px;
      font-weight: 600;
      color: #168035;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 70px;
    }
    
    .details-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    
    .detail-item {
      width: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .detail-label {
      font-size: 9px;
      font-weight: 600;
      color: #595A5C;
      margin-right: 3px;
      max-width: 55%;
    }
    
    .detail-value {
      font-size: 10px;
      font-weight: 700;
      color: #242424;
      max-width: 45%;
    }
    
    .card-footer {
      width: 100%;
      height: 30px;
      background-color: #ECF1F7;
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .view-details-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .view-details-text {
      font-size: 10px;
      font-weight: 700;
      color: #5D768B;
    }
    
    .details-tab-section {
      width: 100%;
      padding-bottom: 20px;
    }
    
    .details-card {
      width: 100%;
      border-radius: 8px;
      border: 1px solid #D5DFFF;
      background-color: #FBFDFF;
      overflow: hidden;
    }
    
    .details-header {
      padding: 0 12px;
      padding-top: 8px;
    }
    
    .details-header-text {
      font-size: 10px;
      font-weight: 700;
      color: #233E55;
      line-height: 10px;
    }
    
    .details-container {
      padding: 12px;
    }
    
    .details-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    
    .details-column {
      flex: 1;
      margin-right: 16px;
    }
    
    .details-column:last-child {
      margin-right: 0;
    }
    
    .details-label {
      font-size: 10px;
      font-weight: 600;
      color: #9D9FA3;
      margin-bottom: 4px;
    }
    
    .details-value {
      font-size: 10px;
      font-weight: 700;
      color: #242424;
      line-height: 14px;
    }
    
    .transactions-container {
      width: 100%;
      padding-bottom: 10px;
    }
    
    .transaction-card {
      width: 100%;
      min-height: auto;
      border-radius: 8px;
      border: 0.5px solid #E0E0E0;
      background-color: #FFFFFF;
      margin-bottom: 16px;
      padding: 12px;
    }
    
    .transaction-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      width: 100%;
    }
    
    .transaction-left-section {
      display: flex;
      align-items: center;
      flex: 1;
    }
    
    .icon-wrapper {
      width: 24px;
      height: 24px;
      border-radius: 12px;
      background-color: #ECF1F7;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 10px;
    }
    
    .transaction-icon {
      font-size: 12px;
    }
    
    .transaction-type {
      font-size: 12px;
      font-weight: 700;
      color: #242424;
      flex: 1;
    }
    
    .transaction-quantity {
      font-size: 12px;
      font-weight: 700;
    }
    
    .transaction-middle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      width: 100%;
    }
    
    .org-section {
      display: flex;
      align-items: center;
      flex: 1;
    }
    
    .organization-code {
      font-size: 10px;
      font-weight: 600;
      color: #9D9FA3;
      margin-left: 34px;
    }
    
    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .status-text {
      font-size: 10px;
      font-weight: 600;
    }
    
    .transaction-divider {
      width: 100%;
      height: 0.5px;
      background-color: #D9E4EE;
      margin-bottom: 8px;
    }
    
    .transaction-bottom-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
    
    .date-section, .location-section {
      display: flex;
      align-items: center;
    }
    
    .label {
      font-size: 10px;
      font-weight: 600;
      color: #9D9FA3;
      margin-right: 4px;
    }
    
    .date-value, .location-value {
      font-size: 10px;
      font-weight: 700;
      color: #242424;
    }
    
    .no-transactions {
      text-align: center;
      padding: 40px 20px;
      color: #9D9FA3;
      font-size: 14px;
      font-style: italic;
    }
    
    .overview-card {
      width: 100%;
      min-height: auto;
      background-color: #E5F6FF;
      border-radius: 8px;
      border: 1px solid #D5DFFF;
      padding: 12px;
      margin-bottom: 20px;
    }
    
    .viewing-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .viewing-text {
      font-size: 12px;
      font-weight: 500;
      color: #233E55;
    }
    
    .attributes-grid {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .attributes-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      gap: 8px;
    }
    
    .attribute-capsule {
      flex: 1;
      min-height: 25px;
      border-radius: 6px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .attribute-text {
      font-size: 12px;
      font-weight: 700;
      color: #233E55;
    }
    
    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #9D9FA3;
      font-size: 14px;
    }
    
    .print-footer {
      width: 100%;
      margin-top: 20px;
      text-align: center;
      font-size: 10px;
      color: #9D9FA3;
      border-top: 1px solid #E0E0E0;
      padding-top: 12px;
      padding-bottom: 15px;
    }
    
    @media print {
      body {
        width: 100%;
        padding: 0;
        margin: 0;
        background-color: white;
        font-size: 10px;
      }
      
      .print-container {
        width: 100%;
        max-width: 100%;
      }
      
      .content-container {
        padding: 0 10px;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .item-header,
      .status-badge,
      .attribute-badge,
      .org-dropdown,
      .assignments-container,
      .primary-badge,
      .active-badge,
      .current-stock-container,
      .in-transit-card,
      .on-order-card,
      .overview-card,
      .details-card {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `,


    printAllTabs: async (itemData, selectedOrganization, tabs = ['Stock', 'Organization', 'Details']) => {
        if (!itemData) {
            Alert.alert('Error', 'No item data to print');
            return;
        }

        try {
            let allHtml = '';

            tabs.forEach((tab, index) => {
                const tabHtml = ItemInquiryPrintComponent.generateHtmlContent(itemData, tab, selectedOrganization);
                const contentMatch = tabHtml.match(/<body>([\s\S]*)<\/body>/);
                if (contentMatch && contentMatch[1]) {
                    if (index > 0) {
                        allHtml += '<div class="page-break"></div>';
                    }
                    allHtml += contentMatch[1];
                }
            });

            const fullHtml = `
      <html>
        <head>
          <style>
            ${ItemInquiryPrintComponent.getCssStyles()}
          </style>
        </head>
        <body>
          ${allHtml}
        </body>
      </html>
      `;

            await RNPrint.print({
                html: fullHtml,
                jobName: `Item_Inquiry_${itemData.itemHeader.itemCode}_All_Tabs_${new Date().getTime()}`
            });
        } catch (error) {
            console.error('Print all tabs error:', error);
            Alert.alert('Print Error', 'Failed to generate print preview for all tabs');
        }
    }
};

export default ItemInquiryPrintComponent;