import api from "services";
import React from "react";
import axios from "axios";
import {
  Page,
  Navbar,
  List,
  ListItem,
  NavTitle,
  NavRight,
  NavLeft,
  Icon,
  Link,
  Searchbar,
} from "framework7-react";
import "./index.scss";
import { inject, observer } from "mobx-react";
import { toJS } from "mobx";
import selectSVG from "../../static/icons/self-select-icon.svg";
import activeSelectSVG from "../../static/icons/self-select-icon-active.svg";

const pageSize = 60;
let CancelToken = axios.CancelToken;
let cancel;

@inject("market")
@observer
export default class SymbolList extends React.Component {
  constructor(props) {
    super(props);

    this.symbolTypeName = this.$f7route.params.symbol_type_name;
    this.state = {
      symbolList: [],
      page: 0,
      next: false,
      selectedSymbols: [],
      isLoading: true,
    };
  }

  componentDidMount() {
    this.getSelfSymbolList();
    this.getSymbolList(
      `type__name=${this.symbolTypeName}&page=1&page_size=${pageSize}`
    );
  }

  static getDerivedStateFromProps(props, state){
    if(state.selectedSymbols.length === 0 && props.market.selfSelectSymbolList.length !== 0){
      const { selfSelectSymbolList } = props.market;
      const selectedSymbolList = selfSelectSymbolList.map(symbol=>{
        return( symbol.symbol )
      })
      return{
        selectedSymbols: selectedSymbolList
      }
    }
    return null;
  }

  getSelfSymbolList = async() => {
    const { selfSelectSymbolList, getSelfSelectSymbolList } = this.props.market;
    if(selfSelectSymbolList.length === 0){
      await getSelfSelectSymbolList(`page=1&page_size=100`);
    }
  }

  getSymbolList = async (query, init = true) => {
    if (cancel != undefined) {
      cancel();
    }
    this.setState({
      isLoading: true,
    });
    const res = await api.market.getSymbolList(query, {
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancel = c;
      }),
    });
    const { selfSelectSymbolList } = this.props.market;
    const ids = selfSelectSymbolList.map((item) => item.symbol_display.id);

    if (init) {
      this.setState((preState) => ({
        // symbolList: [
        //   ...res.data.results.filter((item) => {
        //     return ids.indexOf(item.symbol_display.id) === -1;
        //   }),
        // ],
        symbolList: [...res.data.results],
        next: !!res.data.next,
        page: 1,
      }));
    } else {
      this.setState((preState) => ({
        symbolList: [
          ...this.state.symbolList,
          ...res.data.results.filter((item) => ids.indexOf(item.id) === -1),
        ],
        next: !!res.data.next,
        page: preState.page + 1,
      }));
    }
    this.setState({
      isLoading: false,
    });
  };

  loadMoreSymbol = async (e) => {
    if (this.state.next && !this.state.isLoading) {
      // this.getSymbolList({
      //   type__name: this.symbolTypeName,
      //   page: this.state.page + 1,
      //   page_size: pageSize,
      // }, false)
      this.getSymbolList(
        `type__name=${this.symbolTypeName}&page=${this.state.page + 1}&page_size=${pageSize}`,
        false
      );
    }
  };

  confirm = async () => {
    const res = await api.market.addSelfSelectSymbolList({
      symbol: this.state.selectedSymbols,
    });
    await this.props.market.updateSelfSelectSymbolList();
    this.$f7router.back();
  };

  handleItemOpened = async (item) => {
    await this.props.market.getCurrentSymbol(item.id);
    this.$f7router.navigate(`/market/symbol/${item.id}`, {
      props: {
        currentSymbol: item,
      },
    });
  };

  handleItemSelected = async (id) => {
    const res = await api.market.addSelfSelectSymbolList({
      symbol: [id],
    });
    if (res.status === 201) {
      this.setState((prevState) => ({
        selectedSymbols: [...prevState.selectedSymbols, id],
      }));
    }
  };

  handleItemUnselected = async (id) => {
    const res = await api.market.deleteSelfSelectSymbolList({
      data: {
        symbol: [id],
      },
    });
    if (res.status === 204) {
      this.setState((prevState) => ({
        selectedSymbols: prevState.selectedSymbols.filter(
          (item) => item !== id
        ),
      }));
    }
  };

  handleSearch = (e) => {
    this.getSymbolList(
      `type__name=${this.symbolTypeName}&page=1&page_size=${pageSize}&search=${e.target.value}`
    );
    // this.getSymbolList({
    //   type__name: this.symbolTypeName,
    //   search: e.target.value,
    //   page: 1,
    //   page_size: pageSize,
    // })
  };

  handleClearSearch = () => {
    this.getSymbolList(
      `type__name=${this.symbolTypeName}&page=1&page_size=${pageSize}`
    );
    // this.getSymbolList({
    //   type__name: this.symbolTypeName,
    //   page: 1,
    //   page_size: pageSize,
    // })
  };

  render() {
    const { symbolList, selectedSymbols, isLoading } = this.state;
    return (
      <Page
        noToolbar
        infinite
        infiniteDistance={50}
        onInfinite={this.loadMoreSymbol}
        infinitePreloader={this.state.next}
      >
        <Navbar>
          <NavLeft>
            <Link onClick={() => this.$f7router.back()}>
              <Icon color={"white"} f7={"chevron_left"} size={r(18)}></Icon>
            </Link>
          </NavLeft>
          <NavTitle>{this.symbolTypeName}</NavTitle>
          <NavRight>{/* <span onClick={this.confirm}>??????</span> */}</NavRight>
        </Navbar>
        <div className="symbol-searchbar">
          <Searchbar
            customSearch={true}
            disableButton={false}
            placeholder="??????????????????"
            clearButton={true}
            onChange={this.handleSearch}
            onClickClear={this.handleClearSearch}
          />
        </div>
        <List>
          {symbolList.length === 0 && (
            <ListItem title={isLoading ? "?????????..." : "????????????"}></ListItem>
          )}
          {symbolList.map((item, index) => {
            return (
              // <ListItem title={item.symbol_display.name}>
              //   {
              //     selectedSymbols.indexOf(item.id) === -1 ? (
              //       <div onClick={() => this.handleItemSelected(item.id)} slot="media" className="circle-add-icon" />
              //     ) : (
              //         <div onClick={() => this.handleItemUnselected(item.id)} slot="media" className="circle-add-selected-icon" />
              //       )
              //   }
              //   <span onClick={() => this.handleItemOpened(item)}>
              //     <Icon slot="after" color="#c8c7cc" f7="chevron_right" size={r(18)}></Icon>
              //   </span>
              // </ListItem>
              <ListItem className="search-result-container" key={index}>
                <div
                  className="search-result"
                  onClick={() => {
                    this.handleItemOpened(item);
                  }}
                >
                  <p className="search-result-name">
                    {item?.symbol_display?.name}
                  </p>
                  <p>
                    <span className="symbol-type-code">
                      {item?.symbol_display?.product_display?.market}
                    </span>
                    <span className="symbol-code">
                      {item?.symbol_display?.product_display?.code}
                    </span>
                  </p>
                </div>
                <div className="switch-self-select">
                  {selectedSymbols.indexOf(item.id) === -1 ? (
                    <img
                      src={selectSVG}
                      alt="add-select"
                      onClick={(e) => {
                        this.handleItemSelected(item.id);
                      }}
                    />
                  ) : (
                      <img
                        src={activeSelectSVG}
                        alt="active-select"
                        onClick={(e) => {
                          this.handleItemUnselected(item.id);
                        }}
                      />
                    )}
                </div>
              </ListItem>
            );
          })}
        </List>
      </Page>
    );
  }
}
