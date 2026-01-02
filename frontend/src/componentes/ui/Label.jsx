import { classNames } from '../../utils/classNames';
import styles from './Label.module.css';

export const Label = ({
    children,
    className,
    htmlFor,
    ...props
}) => {
    return (
        <label
            htmlFor={htmlFor}
            className={classNames(styles.label, className)}
            {...props}
        >
            {children}
        </label>
    );
};

export default Label;
