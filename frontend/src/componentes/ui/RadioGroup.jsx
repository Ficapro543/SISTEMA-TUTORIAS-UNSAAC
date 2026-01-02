import { forwardRef } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './RadioGroup.module.css';

export const RadioGroup = ({ className, value, onValueChange, children, ...props }) => {
    return (
        <div className={classNames(styles.radioGroup, className)} role="radiogroup" {...props}>
            {children}
        </div>
    );
};

export const RadioGroupItem = forwardRef(({
    className,
    value,
    id,
    checked,
    onChange,
    ...props
}, ref) => {
    return (
        <div className={styles.radioItemWrapper}>
            <input
                type="radio"
                ref={ref}
                id={id}
                value={value}
                checked={checked}
                onChange={onChange}
                className={classNames(styles.radioItem, className)}
                {...props}
            />
            <div className={styles.radioIndicator}>
                {checked && <div className={styles.radioCircle} />}
            </div>
        </div>
    );
});

RadioGroupItem.displayName = 'RadioGroupItem';
