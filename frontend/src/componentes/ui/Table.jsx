import { forwardRef } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './Table.module.css';

export const Table = forwardRef(({ className, children, ...props }, ref) => (
    <div className={styles.tableWrapper}>
        <table ref={ref} className={classNames(styles.table, className)} {...props}>
            {children}
        </table>
    </div>
));
Table.displayName = 'Table';

export const TableHeader = forwardRef(({ className, children, ...props }, ref) => (
    <thead ref={ref} className={classNames(styles.tableHeader, className)} {...props}>
        {children}
    </thead>
));
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef(({ className, children, ...props }, ref) => (
    <tbody ref={ref} className={classNames(styles.tableBody, className)} {...props}>
        {children}
    </tbody>
));
TableBody.displayName = 'TableBody';

export const TableRow = forwardRef(({ className, children, ...props }, ref) => (
    <tr ref={ref} className={classNames(styles.tableRow, className)} {...props}>
        {children}
    </tr>
));
TableRow.displayName = 'TableRow';

export const TableHead = forwardRef(({ className, children, ...props }, ref) => (
    <th ref={ref} className={classNames(styles.tableHead, className)} {...props}>
        {children}
    </th>
));
TableHead.displayName = 'TableHead';

export const TableCell = forwardRef(({ className, children, ...props }, ref) => (
    <td ref={ref} className={classNames(styles.tableCell, className)} {...props}>
        {children}
    </td>
));
TableCell.displayName = 'TableCell';
