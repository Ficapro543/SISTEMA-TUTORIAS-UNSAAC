import { useEffect } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './Dialog.module.css';

export const Dialog = ({ open, onOpenChange, children }) => {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className={styles.dialogPortal}>
            <div
                className={styles.dialogOverlay}
                onClick={() => onOpenChange && onOpenChange(false)}
            />
            <div className={styles.dialogWrapper}>
                {children}
            </div>
        </div>
    );
};

export const DialogContent = ({ className, children, ...props }) => {
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className={classNames(styles.dialogContent, className)}
            onClick={handleContentClick}
            {...props}
        >
            {children}
        </div>
    );
};

export const DialogHeader = ({ className, children, ...props }) => (
    <div className={classNames(styles.dialogHeader, className)} {...props}>
        {children}
    </div>
);

export const DialogTitle = ({ className, children, ...props }) => (
    <h2 className={classNames(styles.dialogTitle, className)} {...props}>
        {children}
    </h2>
);

export const DialogDescription = ({ className, children, ...props }) => (
    <p className={classNames(styles.dialogDescription, className)} {...props}>
        {children}
    </p>
);

export const DialogFooter = ({ className, children, ...props }) => (
    <div className={classNames(styles.dialogFooter, className)} {...props}>
        {children}
    </div>
);
