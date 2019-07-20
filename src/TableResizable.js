import React from 'react';
import {Table} from 'reactstrap';
import classNames from 'classnames';

class TableResizable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            dragZone: {
                initHeaderWidths: [],
                colIndex: undefined,
                startX: undefined
            }
        };

        this.columnRefs = [];
        this.headerRefs = [];

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.stopPropagation = this.stopPropagation.bind(this);
    }

    componentDidMount() {
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('mousemove', this.onMouseMove);
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('mousemove', this.onMouseMove);
    }

    render() {
        const {initColWidth, headers, rows, className, ...attrs} = this.props;

        let colsJsx = null;
        let headJsx = null;
        let rowsJsx = null;

        if (headers) {
            colsJsx = headers.map((head, i) =>
                <col key={i}
                     style={!initColWidth ? null : {width: initColWidth[i]}}
                     ref={ref => this.setColRef(ref, i)}/>
            );

            const thJsx = headers.map((head, i) => {
                let resizeDrugZone = null;
                if ((i + 1) !== headers.length) {
                    const processedClassName = classNames('resize-drag-zone', {
                        dragging: (i === this.state.dragZone.colIndex)
                    });
                    resizeDrugZone = (
                        <div className={processedClassName}
                             data-col-index={i}
                             onMouseDown={this.onMouseDown}
                             onClick={this.stopPropagation}>
                            <div className="splitter splitter-left"/>
                            <div className="splitter splitter-right"/>
                        </div>);
                }
                return (
                    <th key={i} className="p-0" {...head.props} ref={ref => this.setHeadRef(ref, i)}>
                        <div className="th-content-wrapper">
                            <div className="content">
                                {head.content}
                            </div>
                            {resizeDrugZone}
                        </div>
                    </th>);
            });
            headJsx = <thead>
            <tr>{thJsx}</tr>
            </thead>;
        } else if (initColWidth) {
            colsJsx = initColWidth.map((width, i) => <col key={i} style={{width: width}}
                                                          ref={ref => this.setRef(ref, i)}/>);
        }

        if (rows) {
            rowsJsx = rows.map((row, i) => {
                const tdsJsx = row.map((col, j) => {
                    let resizeDrugZone = null;
                    if ((j + 1) !== row.length) {
                        const processedClassName = classNames('resize-drag-zone', {
                            dragging: (j === this.state.dragZone.colIndex)
                        });
                        resizeDrugZone = (
                            <div className={processedClassName}
                                 data-col-index={j}
                                 onMouseDown={this.onMouseDown}
                                 onClick={this.stopPropagation}>
                                <div className="splitter splitter-left"/>
                                <div className="splitter splitter-right"/>
                            </div>);
                    }
                    return (
                        <td key={j} className="p-0" {...col.props}>
                            <div className="td-content-wrapper">
                                <div className="content">
                                    {col.content}
                                </div>
                                {resizeDrugZone}
                            </div>
                        </td>);
                });
                return <tr key={i} {...row.props}>{tdsJsx}</tr>;
            });
        }

        const colGroupJsx = <colgroup>{colsJsx}</colgroup>;

        const processedClassName = classNames(className, 'table-resizable');

        return (
            <Table className={processedClassName} {...attrs}>
                {colGroupJsx}
                {headJsx}
                <tbody>
                {rowsJsx}
                </tbody>
            </Table>
        );
    }

    onMouseDown(e) {
        this.stopPropagation(e);

        const headerWidths = this.headerRefs.map(ref => ref.offsetWidth);
        headerWidths.forEach((width, i) => this.columnRefs[i].style.width = `${width}px`);

        this.setState({
            ...this.state,
            dragZone: {
                ...this.state.dragZone,
                initHeaderWidths: headerWidths,
                colIndex: Number(e.currentTarget.attributes['data-col-index'].value),
                startX: e.nativeEvent.clientX
            }
        });
    }

    onMouseMove(e) {
        if (this.state.dragZone.startX) {
            this.stopPropagation(e);
            const diffX = e.screenX - this.state.dragZone.startX;

            if (diffX !== 0) {
                const {initHeaderWidths, colIndex} = this.state.dragZone;
                const headerWidths = [];

                if (diffX > 0) {
                    headerWidths[colIndex] = initHeaderWidths[colIndex] + diffX;
                    const restX = diffX / (initHeaderWidths.length - 1 - colIndex);
                    for (let i = (colIndex + 1); i < initHeaderWidths.length; i++) {
                        headerWidths[i] = initHeaderWidths[i] - restX;
                    }
                } else {
                    headerWidths[colIndex + 1] = initHeaderWidths[colIndex + 1] + (diffX * -1);
                    const restX = (diffX * -1) / (initHeaderWidths.length - 1 - colIndex);
                    for (let i = 0; i < colIndex + 1; i++) {
                        headerWidths[i] = initHeaderWidths[i] - restX;
                    }
                }

                headerWidths.forEach((width, i) => this.columnRefs[i].style.width = `${width}px`);
            }
        }
    }

    onMouseUp(e) {
        if (this.state.dragZone.startX) {
            this.stopPropagation(e);

            const headerWidths = this.headerRefs.map(ref => ref.offsetWidth);
            headerWidths.forEach((width, i) => this.columnRefs[i].style.width = `${width}px`);

            this.setState({
                ...this.state,
                dragZone: {
                    initHeaderWidths: [],
                    colIndex: undefined,
                    startX: undefined
                }
            });
        }
    }

    stopPropagation(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    setColRef(ref, i) {
        this.columnRefs[i] = ref;
    }

    setHeadRef(ref, i) {
        this.headerRefs[i] = ref;
    }
}

export default TableResizable;
