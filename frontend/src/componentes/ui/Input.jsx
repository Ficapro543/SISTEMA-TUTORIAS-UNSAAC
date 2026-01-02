import { forwardRef } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './Input.module.css';

export const Input = forwardRef(({
    className,
    type = 'text',
    disabled = false,
    ...props
}, ref) => {
    return (
        <input
            type={type}
            className={classNames(
                styles.input,
                disabled && styles.disabled,
                className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export default Input;
