import { forwardRef } from 'react';
import { classNames } from '../../utils/classNames';
import styles from './Textarea.module.css';

export const Textarea = forwardRef(({
    className,
    ...props
}, ref) => {
    return (
        <textarea
            className={classNames(styles.textarea, className)}
            ref={ref}
            {...props}
        />
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;
