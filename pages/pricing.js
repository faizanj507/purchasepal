import React,{useState} from 'react';
import {GETUSERPLAN, SUBSCRIBEPLAN, CHECKCOUPON} from '../fetchAPI';

import {Button, Card,DataTable,Layout,Page, TextField, TextStyle} from '@shopify/polaris';

export default function Pricing(){
    let [plan,setplan] = useState(null);
    let [isplanactive,setisplanactive] = useState(false);
    let [coupon,setcoupon] = useState("");
    let [couponmsg,setcouponmsg] = useState("");
    let [couponvalid,setcouponvalid] = useState("negative");
    


    GETUSERPLAN().then(res=>{
        res.json().then(data=>{
            setplan(data[0].plan_name)
            setisplanactive(data[0].is_active)
        })
    })


    function subscribe(plan_id){
        let data = {plan_id:plan_id,couponcode:coupon}
        SUBSCRIBEPLAN(data).then(res=>{
            // let shop = parent.window.location.hostname;
            // top.location.replace(process.env.HOST+"/auth/inline?shop="+shop);
            top.location.replace(`${location.protocol}//${location.hostname}/newplanselected`)
        })

    }

    function couponcheck(){
        let data = {couponcode:coupon}
        if(coupon == ""){
            setcouponmsg("Please enter a coupon code")
            setcouponvalid("negative")
            return
        }
        CHECKCOUPON(data).then(res=>{
            res.json().then(data=>{
                if(data.status=="success"){
                    setcouponvalid("positive")
                    setcouponmsg(data.message)
                }else{
                    setcouponvalid("negative")
                    setcouponmsg(data.message)
                }
            })
        })
    }
    let btnstartertext = plan=="STARTER"?isplanactive?"Subscribed":"Re Activate":"Buy Now";
    let btnprotext = plan=="PRO"?isplanactive?"Subscribed":"Re Activate":"Buy Now";
    let btnpremiumtext = plan=="PREMIUM"?isplanactive?"Subscribed":"Re Activate":"Buy Now";
    return(
        <Page title="Upgrade Your Plan">
            <Layout>
                <Layout.Section secondary>
                    <Card title="STARTER" sectioned>
                        <DataTable
                            columnContentTypes={[
                                'text',
                            ]}
                            headings={[
                                'Includes',
                            ]}
                            rows={[
                                ['100 Emails'],
                                ['10k Sessions'],
                                ['$9.99/month'],
                                [<Button primary onClick={()=>{subscribe(1)}} disabled={plan=="STARTER"?isplanactive?true:false:false}>{btnstartertext}</Button>],
                            ]}
                            defaultSortDirection="descending"
                        />
                    </Card>
                </Layout.Section>
                <Layout.Section secondary>
                    <Card title="PRO" sectioned>
                        <DataTable
                            columnContentTypes={[
                                'text',
                            ]}
                            headings={[
                                'Includes',
                            ]}
                            rows={[
                                ['500 Emails'],
                                ['50k Sessions'],
                                ['$24.99/month'],
                                [<Button primary onClick={()=>{subscribe(2)}} disabled={plan=="PRO"?isplanactive?true:false:false}>{btnprotext}</Button>],
                            ]}
                            defaultSortDirection="descending"
                        />

                    </Card>
                </Layout.Section>
                <Layout.Section secondary>
                    <Card title="PREMIUM" sectioned>
                        <DataTable
                            columnContentTypes={[
                                'text',
                            ]}
                            headings={[
                                'Includes',
                            ]}
                            rows={[
                                ['Unlimited Emails'],
                                ['Unlimited Sessions'],
                                ['$59/month'],
                                [<Button primary onClick={()=>{subscribe(3)}} disabled={plan=="PREMIUM"?isplanactive?true:false:false}>{btnpremiumtext}</Button>],
                            ]}
                            defaultSortDirection="descending"
                        />
                    </Card>
                </Layout.Section>
            </Layout>
            <br/>
            <Card title="Coupon Code">
                <div style={{padding:"20px"}}>
                    <TextField label="Enter your coupon code" value={coupon} onChange={(newValue)=>{setcoupon(newValue)}}/>
                    <TextStyle variation={couponvalid}>{couponmsg}</TextStyle>
                    <br/>
                    <Button primary onClick={()=>{couponcheck()}}>Apply</Button>
                </div>
            </Card>
        </Page>
    )
}