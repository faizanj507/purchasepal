import react from 'react';
import {Page} from '@shopify/polaris';
import Themes from '../components/Theme';
import Themesetupcomp from '../components/themesetupcomp';

export default function Theme(){
    return (
        <Page title="App Theme">
            <Themes />
            {/* <Themesetupcomp/> */}
        </Page>
    )
}