import { Page, Layout, Card, Badge, Banner, Icon, Tooltip,SkeletonDisplayText } from "@shopify/polaris";
import { useEffect, useState } from "react";
import ProductTable from "../components/ProductTable";
import {GETALLREMINDERS,GETPENDINGREMINDERS,GETSENTREMINDERS, GETGRAPHDATA, GETUSERPLAN,GETNEWREMINDERS, GETREVENUE} from '../fetchAPI';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import { useRouter } from "next/router";
import {InfoMinor} from '@shopify/polaris-icons';
const Index = () => {
  let [totalReminders,setTotalReminders] = useState(<SkeletonDisplayText size="small" />);
  let [totalSent,setTotalSent] = useState(<SkeletonDisplayText size="small" />);
  let [totalPending,setTotalPending] = useState(<SkeletonDisplayText size="small" />)
  let [sentgraphdata,setsentgraphdata] = useState([]);
  let [totalgraphdata,settotalgraphdata] = useState([]);
  let [pendinggraphdata,setpendinggraphdata] = useState([]);
  let [Plan,setPlan] = useState();
  let [remiaingresource,setremiaingresource] = useState(10);
  let [newreminders,setnewreminders] = useState([]);
  let [revenue,setrevenue] = useState(0);
  let router = useRouter();


  useEffect(()=>{

    GETREVENUE().then(res=>{
      res.text().then(res=>{
        console.log(res)
        setrevenue(res);
      })
    })


    GETNEWREMINDERS().then(res=>{
      res.json().then(res=>{
        setnewreminders(res)
      })
    })
    
    GETUSERPLAN().then(res=>{
      res.json().then(data=>{
          setPlan(data[0].plan_name)
          setremiaingresource(data[0].email_remaining)
      })
  })
    GETALLREMINDERS().then(res=>{
        res.json().then(res=>{
          setTotalReminders(res.length)
        })
    })

    GETSENTREMINDERS().then(res=>{
        res.json().then(res=>{
          setTotalSent(res.length)
        })
    })

    GETPENDINGREMINDERS().then(res=>{
        res.json().then(res=>{
          setTotalPending(res.length)
        })
    })


    GETGRAPHDATA().then(res=>{
      let temptotal = []
      let tempsent = []
      let temppending = []
      res.json().then(res=>{
        res[0].map(data=>{
          temptotal.push(data.count)
        })
        res[1].map(data=>{
          tempsent.push(data.count)
        })
        res[2].map(data=>{
          temppending.push(data.count)
        })
        if(temptotal.length<10){
          for(let i=0;i<10-temptotal.length;i++){
            temptotal.push(0)
          }
        }
        if(tempsent.length<10){
          for(let i=0;i<10-tempsent.length;i++){
            tempsent.push(0)
          }
        }
        if(temppending.length<10){
          for(let i=0;i<10-temppending.length;i++){
            temppending.push(0)
          }
        }
        settotalgraphdata(temptotal)
        setsentgraphdata(tempsent)
        setpendinggraphdata(temppending)
      })
  })
  },[])


  let gotopricing = ()=>{
    // goto pricing page
    router.push("/pricing")
  }
  
return(
  <>
  {remiaingresource < 1?
  <Banner title="Resubscribe the plan" status="critical">
    You have used your all emails please resubscribe the plan or upgrade to premium
  </Banner>
  :null}
  <Page title="Welcome To Remind Hero" titleMetadata={<Badge status="success">{Plan}</Badge>} primaryAction={{content: 'Upgrade', disabled: false, onAction:()=>{gotopricing()}}} fullWidth={true}>
      <Layout>
        <Layout.Section secondary>
          <Card title={<><b style={{display:"flex",justifyContent:"space-between"}}>Total Reminds <span><Tooltip  content="Here you can see total reminders"><Icon source={InfoMinor} color="base" /></Tooltip></span></b></>} sectioned>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",fontSize:"20px"}}>
              <p>{totalReminders}</p>
              <Sparklines max={Math.max(...totalgraphdata)*1.5} data={totalgraphdata} limit={10} style={{width:"100px",height:"40px"}}>
                <SparklinesLine color="blue" style={{strokeWidth:"3px"}} />
              </Sparklines>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section secondary>
          <Card title={<><b style={{display:"flex",justifyContent:"space-between"}}>Sent <span><Tooltip  content="Here you can see total sent reminders"><Icon source={InfoMinor} color="base" /></Tooltip></span></b></>} sectioned>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",fontSize:"20px"}}>
              <p>{totalSent}</p>
              <Sparklines max={Math.max(...sentgraphdata)*1.5} data={sentgraphdata} limit={10} style={{width:"100px",height:"40px"}}>
                <SparklinesLine color="blue" style={{strokeWidth:"3px"}} />
              </Sparklines>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section secondary>
          <Card title={<><b style={{display:"flex",justifyContent:"space-between"}}>Pending <span><Tooltip  content="Here you can see total pending reminders"><Icon source={InfoMinor} color="base" /></Tooltip></span></b></>} sectioned>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",fontSize:"20px"}}>
              <p>{totalPending}</p>
              <Sparklines max={Math.max(...pendinggraphdata)*1.5} data={pendinggraphdata} limit={10} style={{width:"100px",height:"40px"}}>
                <SparklinesLine color="blue" style={{strokeWidth:"3px"}} />
              </Sparklines>
            </div>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card title={<><b style={{display:"flex",justifyContent:"space-between"}}>New Reminders <span><Tooltip  content="In this widget you can see the last 7 days reminders"><Icon source={InfoMinor} color="base" /></Tooltip></span></b></>} sectioned>
            <p style={{fontSize:"20px",display:"flex",marginTop:"20px"}}>{newreminders}</p>
          </Card>
        </Layout.Section>

      </Layout>
      <br/>
      </Page>
      <ProductTable/>
  </>
)
};

export default Index;
