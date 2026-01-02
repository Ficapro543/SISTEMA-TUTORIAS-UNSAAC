import { forwardRef } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './Card.module.css';

export const Card = forwardRef(({ className, children, ...props }, ref) => (
    <div ref={ref} className={classNames(styles.card, className)} {...props}>
        {children}
    </div>
));
Card.displayName = 'Card';

export const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
    <div ref={ref} className={classNames(styles.cardHeader, className)} {...props}>
        {children}
    </div>
));
CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef(({ className, children, ...props }, ref) => (
    <div ref={ref} className={classNames(styles.cardContent, className)} {...props}>
        {children}
    </div>
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef(({ className, children, ...props }, ref) => (
    <div ref={ref} className={classNames(styles.cardFooter, className)} {...props}>
        {children}
    </div>
));
CardFooter.displayName = 'CardFooter';

export const CardTitle = forwardRef(({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={classNames(styles.cardTitle, className)} {...props}>
        {children}
    </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef(({ className, children, ...props }, ref) => (
    <p ref={ref} className={classNames(styles.cardDescription, className)} {...props}>
        {children}
    </p>
));
CardDescription.displayName = 'CardDescription';
