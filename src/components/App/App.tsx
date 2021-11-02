import * as React from "react";

import styles from "./App.scss";

export class App extends React.Component<{},{}>
{
    state = {};

    render()
    {
        const {} = this.state;

        return (
            <div className={styles.hello}>Hello World!</div>            
        );
    }
}