import React, { Component } from 'react';

interface Props {
   ticker?: any;
}

type dataState = {
    data: any[],
    signal: any;
}

class StockRow extends Component<Props, dataState>{
    constructor(props :Props) {
        super(props)
        this.state = {
            data:[],
            signal:{}
        }
    }

    componentDidMount() {
        const url = 
        `http://127.0.0.1:3000/api/v1/markets/history?symbol=${this.props.ticker}&interval=daily`
        

        fetch(url)
        .then((response) => response.json())
        .then((data) => {
                this.setState({
                    data: data.history.day.reverse()
                })
        })
        
        this.CheckSignal()
    }

    CheckSignal(){
        let data = this.state.data
        let length = data.length;
        
        if (length >= 4)
        {
            let rr = 18;

            let lowArr = [data[0].low,data[1].low,data[2].low,data[3].low];
            let lower = Math.min(...lowArr);

            let highArr = [data[0].high,data[1].high,data[2].high,data[3].high];
            let upper = Math.max(...highArr);

            let open, sl, tp;

            if
            (
                data[0].close > data[1].close &&
                data[1].close > data[2].close &&
                data[2].close < data[3].close &&
                data[3].close < data[4].close
            )
            {
                open = upper;
                sl = upper-(upper-lower)/rr;
                tp = upper+(upper-(upper-(upper-lower)/rr))*30;
            }

            if
            (
                data[0].close < data[1].close &&
                data[1].close < data[2].close &&
                data[2].close > data[3].close &&
                data[3].close > data[4].close
            )
            {
                open = lower;
                sl = lower+(upper-lower)/rr;
                tp = lower-(lower+(upper-lower)/rr-lower)*30;
            }

            this.setState({
                signal: {
                    open: open,
                    sl: sl,
                    tp: tp
                }
            })

        }
        
    }

    render() {
        // if(this.state.data[this.state.data.length-1].close ==null)
        // {
        //     return(
        //         <tr>
        //             <td>{this.props.ticker}</td>
        //             <td />
        //             <td />
        //             <td />
        //             <td />
        //             <td />
        //             <td />
        //         </tr>
        //     )
        // }
        // if(this.state.data.length >= 4 &&this.state.signal.open != null){
        if(this.state.data.length >= 4 ){
            return (
                <tr>
                    <td>{this.props.ticker}</td>
                    <td>{this.state.data[0].close}</td>
                    <td>{this.state.data[0].date}</td>
                    <td>{this.state.signal.open}</td>
                    <td>{this.state.signal.sl}</td>
                    <td>{this.state.signal.tp}</td>
                </tr>
            );
        }else{
            return<tr />
        }
        
    }
}

export default StockRow;