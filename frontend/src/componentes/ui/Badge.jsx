import { classNames } from '../../utils/classNames';
import styles from './Badge.module.css';

export const Badge = ({
    children,
    className,
    variant = 'default',
    ...props
}) => {
    return (
        <div
            className={classNames(
                styles.badge,
                styles[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Badge;
