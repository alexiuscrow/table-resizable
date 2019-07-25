import React from 'react';
import {Table} from 'reactstrap';
import classNames from 'classnames';

class TableResizable extends React.Component {

    constructor(props) {
        super(props);

        this.MIN_COLUMN_WIDTH = 100; // px

        this.state = {
            dragZone: {
                startColumnWidths: [],
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
                const tdsJsx = row.columns.map((col, j) => {
                    let resizeDrugZone = null;
                    if ((j + 1) !== row.columns.length) {
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
                    const processedClassName = classNames('p-0', (col.props || {}).className);
                    const processedContentClassName = classNames('content', ((col.contentBlock || {}).props || {}).className);
                    return (
                        <td key={j} {...col.props} className={processedClassName}>
                            <div className="td-content-wrapper">
                                <div {...(col.contentBlock || {}).props} className={processedContentClassName}>
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

        const columnWidths = this.headerRefs.map(ref => ref.offsetWidth);
        columnWidths.forEach((width, i) => this.columnRefs[i].style.width = `${width}px`);

        this.setState({
            ...this.state,
            dragZone: {
                ...this.state.dragZone,
                startColumnWidths: columnWidths,
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
                const resizedColumnsWidths = this.getResizedColumnsWidths(diffX);

                if (resizedColumnsWidths.every(w => !w)) {
                    const startColumnWidths = this.headerRefs.map(ref => ref.offsetWidth);
                    const prevStartX = this.state.dragZone.startX;
                    this.setState({
                        ...this.state,
                        dragZone: {
                            ...this.state.dragZone,
                            startColumnWidths: startColumnWidths,
                            startX: e.screenX
                        }
                    }, () => {
                        const diffX = this.state.dragZone.startX - prevStartX;
                        if (diffX !== 0) {
                            this.getResizedColumnsWidths(diffX).forEach((width, i) => width && (this.columnRefs[i].style.width = `${width}px`));
                        }
                    });
                } else {
                    resizedColumnsWidths.forEach((width, i) => width && (this.columnRefs[i].style.width = `${width}px`));
                }
            }
        }
    }

    onMouseUp(e) {
        if (this.state.dragZone.startX) {
            this.stopPropagation(e);

            const columnWidths = this.headerRefs.map(ref => ref.offsetWidth);
            columnWidths.forEach((width, i) => this.columnRefs[i].style.width = `${width}px`);

            this.setState({
                ...this.state,
                dragZone: {
                    startColumnWidths: [],
                    colIndex: undefined,
                    startX: undefined
                }
            });
        }
    }

    getResizedColumnsWidths(diffX, startColumnWidths, colIndex, columnWidths = []) {
        if (!startColumnWidths || (!colIndex && colIndex !== 0)) {
            return this.getResizedColumnsWidths(diffX, this.state.dragZone.startColumnWidths, this.state.dragZone.colIndex);
        }

        if (diffX > 0) {
            const restX = diffX / (startColumnWidths.length - (colIndex + 1) - columnWidths.filter(h => h === false).length);
            for (let i = (colIndex + 1); i < startColumnWidths.length; i++) {
                if (columnWidths[i] !== false) {
                    const resultWidth = startColumnWidths[i] - restX;
                    if (resultWidth < this.MIN_COLUMN_WIDTH) {
                        columnWidths[i] = false;
                        return this.getResizedColumnsWidths(diffX, startColumnWidths, colIndex, columnWidths);
                    } else {
                        columnWidths[i] = resultWidth;
                    }
                }
            }

            if (columnWidths.some(w => w !== false)) {
                columnWidths[colIndex] = startColumnWidths[colIndex] + diffX;
            } else {
                columnWidths[colIndex] = false;
            }
        } else {
            const restX = (diffX * -1) / (startColumnWidths.length - (startColumnWidths.length - (colIndex + 1)) - columnWidths.filter(h => h === false).length);
            for (let i = 0; i < colIndex + 1; i++) {
                if (columnWidths[i] !== false) {
                    const resultWidth = startColumnWidths[i] - restX;
                    if (resultWidth < this.MIN_COLUMN_WIDTH) {
                        columnWidths[i] = false;
                        return this.getResizedColumnsWidths(diffX, startColumnWidths, colIndex, columnWidths);
                    } else {
                        columnWidths[i] = resultWidth;
                    }
                }
            }

            if (columnWidths.some(w => w !== false)) {
                columnWidths[colIndex + 1] = startColumnWidths[colIndex + 1] + (diffX * -1);
            } else {
                columnWidths[colIndex] = false;
            }
        }

        return columnWidths;
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
