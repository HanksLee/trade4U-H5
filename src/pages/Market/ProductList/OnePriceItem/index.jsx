import React from "react";

export default ({ thisRouter , item , currentSymbolType}) => {
  return (
    <div
      className="self-select-tr"
      key={item.symbol}
      data-id={item.id}
      onClick={() => {
        thisRouter.navigate(`/market/symbol/${id}`, {
          props: {
            currentSymbol: item,
            currentSymbolType,
          },
        });
      }}
    >
      <div className="item-main-info">
        <div className="self-select-name">{item?.symbol_display?.name}</div>
        <div
          className={`self-select-buy-sell-block ${
            item?.product_details?.change > 0 && "p-up stock-green"
          } ${item?.product_details?.change < 0 && "p-down stock-red-gif"}`}
        >
          {item?.product_details?.sell}
        </div>
        <div
          className={`self-select-buy-sell-block ${
            item?.product_details?.change > 0 && "p-up stock-green"
          } ${item?.product_details?.change < 0 && "p-down stock-red-gif"}`}
        >
          {item?.product_details?.chg}%
        </div>
      </div>
    </div>
  );
};
