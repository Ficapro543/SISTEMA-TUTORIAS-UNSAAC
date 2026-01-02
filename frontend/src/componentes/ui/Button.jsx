import { classNames } from '../../utils/classNames';
import styles from './Button.module.css';

export const Button = ({
    children,
    className,
    variant = 'primary',
    size = 'default',
    disabled = false,
    onClick,
    type = 'button',
    ...props
}) => {
    const buttonClass = classNames(
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        className
    );

    return (
        <button
            type={type}
            className={buttonClass}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
