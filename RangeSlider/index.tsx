import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import './index.less';

interface IProps {
  min: number;
  max: number;
  step?: number;
  minValue: number; // slider 左边滑块初始位置
  maxValue: number; // slider 右边滑块初始位置
  blockColor: string;
  backgroundColor: string;
  selectedColor: string;
  minValueChange: Function;
  maxValueChange: Function;
}
export default class Index extends Taro.Component<IProps, any>{
  static defaultProps = {
    step: 0,
    min: 0,
    max: 10000,
    minValueChange: () => { },
    maxValueChange: () => { },
  }

  state = {
    leftValue: 0, // slider 左边滑块位置
    rightValue: 10000, // slider 右边滑块位置
    totalLength: 0,
    bigLength: 0,
    ratio: 0.5,
    sliderLength: 10, // 左右滑块的最小距离
    containerLeft: 28, //标识整个组件，距离屏幕左边的距离
    containerRight: 28, //标识整个组件，距离屏幕右边的距离
    hideOption: '', //初始状态为显示组件
  }

  componentDidMount() {
    const that = this;
    // const getSystemInfo = wxPromisify(Taro.getSystemInfo);
    // const queryContainer = wxPromisify(Taro.createSelectorQuery().in(this).select(".container").boundingClientRect)
    Taro.getSystemInfo().then((res: any) => {
      console.log("getSystemInfo", res);
      const { sliderLength, containerLeft, containerRight } = this.state;
      const ratio = res.windowWidth / 750;
      const containerWidth = 750 - containerRight - containerLeft;
      that.setState({
        ratio,
        totalLength: containerWidth,
        bigLength: containerWidth - sliderLength * 2,
        rightValue: containerWidth - sliderLength,
      }, () => {
        that._propertyLeftValueChange();
        that._propertyRightValueChange();
      });
    })
    // });
  }


  /**
     * 设置左边滑块的值
     */
  _propertyLeftValueChange = () => {
    const { max, min, minValue } = this.props;
    const { bigLength } = this.state;
    const leftParam = minValue / max * bigLength;
    const minParam = min / max * bigLength;
    this.setState({
      leftValue: leftParam - minParam,
    })
  }

  /**
   * 设置右边滑块的值
   */
  _propertyRightValueChange = () => {
    const { maxValue, max } = this.props;
    const { bigLength, sliderLength } = this.state;
    const right = maxValue / max * bigLength + sliderLength;
    this.setState({
      rightValue: right,
    })
  }

  /**
   * 左边滑块滑动
   */
  _minMove = (e: any) => {
    const { min, max } = this.props;
    const { ratio, containerLeft, sliderLength, rightValue, bigLength } = this.state;
    let pagex = e.changedTouches[0].pageX / ratio - containerLeft - sliderLength / 2;
    if (pagex + sliderLength >= rightValue) {
      pagex = rightValue - sliderLength;
    } else if (pagex <= 0) {
      pagex = 0;
    }
    this.setState({
      leftValue: pagex,
    })

    let lowValue = parseInt(((pagex / bigLength * parseInt((max - min).toString()) + min)).toString());
    const myEventDetail = { lowValue: lowValue };
    this.props.minValueChange(myEventDetail);
  }

  /**
   * 右边滑块滑动
   */
  _maxMove = (e: any) => {

    const { min, max } = this.props;
    const { ratio, containerLeft, sliderLength, leftValue, totalLength, bigLength } = this.state;
    let pagex = e.changedTouches[0].pageX / ratio - containerLeft - sliderLength / 2;
    if (pagex <= leftValue + sliderLength) {
      pagex = leftValue + sliderLength;
    } else if (pagex >= totalLength) {
      pagex = totalLength;
    }
    this.setState({
      rightValue: pagex,
    })

    pagex = pagex - sliderLength
    const highValue = parseInt((pagex / bigLength * (max - min) + min).toString());

    const myEventDetail = { highValue: highValue }
    this.props.maxValueChange(myEventDetail);
  }

  /**
   * 隐藏组件
   */
  hide = () => {
    this.setState({
      hideOption: 'hide',
    })
  }

  /**
   * 显示组件
   */
  show = () => {
    this.setState({
      hideOption: '',
    })
  }
  /**
  * 重置
  */
  reset = () => {
    const { totalLength } = this.state;
    this.setState({
      rightValue: totalLength,
      leftValue: 0,
    })
  }

  render() {
    const { leftValue, rightValue, sliderLength, totalLength } = this.state;
    const { blockColor, backgroundColor, selectedColor } = this.props;

    return <View className="slider">
      <View className="sliderItem min" style={{ left: `${leftValue}rpx`, backgroundColor: `${blockColor}` }} onTouchMove={this._minMove}></View>
      <View className="sliderItem max" style={{ left: `${rightValue}rpx`, backgroundColor: `${blockColor}` }} onTouchMove={this._maxMove}></View>
      <View className="sliderBody left" style={{ left: `0rpx`, width: `${leftValue}rpx`, background: `${backgroundColor}` }}></View>
      <View className="sliderBody body" style={{ left: `${leftValue}rpx`, width: `${rightValue - leftValue}rpx`, backgroundColor: `${selectedColor}`, opacity: 0.28, }}></View>
      <View className="sliderBody right" style={{ left: `${rightValue}rpx`, width: `${totalLength - rightValue}rpx`, backgroundColor: `${backgroundColor}` }}></View>
    </View>
  }
}