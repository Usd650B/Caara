"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Save,
  ChevronRight,
  ShieldCheck,
  FileText,
  Activity,
  X
} from "lucide-react"
import Link from "next/link"
import { getOrder, updateOrder, Order, OrderItem } from "@/lib/firestore"

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const loadOrder = async () => {
      if (orderId) {
        try {
          const orderData = await getOrder(orderId)
          if (orderData) {
            setOrder(orderData)
            setNotes(orderData.notes || "")
          }
        } catch (error) {
          console.error("Error loading order:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    loadOrder()
  }, [orderId])

  const handleStatusUpdate = async (newStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled") => {
    if (!order) return
    try {
      await updateOrder(orderId, { status: newStatus })
      setOrder({ ...order, status: newStatus })
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handleNotesUpdate = async () => {
    if (!order) return
    try {
      await updateOrder(orderId, { notes })
      setOrder({ ...order, notes })
      setIsEditingNotes(false)
    } catch (error) {
       console.error("Error updating notes:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
          <X className="h-10 w-10 text-black/20" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Order Not Located</h1>
        <p className="text-black/40 text-sm max-w-xs mb-8">The requested order manifest could not be retrieved from the central vault.</p>
        <Button asChild className="bg-black text-white px-8 rounded-xl font-bold h-12">
          <Link href="/admin">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="h-24 bg-white/80 backdrop-blur-md border-b border-black/5 px-8 md:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-6">
          <Link href="/admin" className="p-3 hover:bg-black/5 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
             <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-black/20 mb-1">
               <span>Manifest</span>
               <ChevronRight className="h-3 w-3" />
               <span className="text-black">Audit Control</span>
             </div>
             <h1 className="text-xl font-black tracking-tighter">Order #{order.id?.slice(-8).toUpperCase()}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center ${
              order.status === 'delivered' ? 'bg-green-50 text-green-600' :
              order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
              'bg-blue-50 text-blue-600'
           }`}>
             <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                order.status === 'delivered' ? 'bg-green-500' :
                order.status === 'cancelled' ? 'bg-red-500' :
                'bg-blue-500 animate-pulse'
             }`} />
             {order.status}
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Manifest Logic */}
          <div className="lg:col-span-2 space-y-12">
            {/* Asset List */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Acquired Assets ({order.items?.length || 0})</h2>
              </div>
              <div className="bg-white rounded-[2.5rem] border border-black/5 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="divide-y divide-black/5">
                  {order.items?.map((item: OrderItem, index: number) => (
                    <div key={index} className="p-8 flex items-center gap-8 group hover:bg-black/[0.01] transition-colors">
                      <div className="w-24 h-32 bg-black/[0.03] rounded-2xl overflow-hidden shadow-sm">
                        {item.image && (
                          <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-black text-black">{item.name}</h3>
                          <span className="text-lg font-black">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-black/40">
                          {item.size && <span className="bg-black/5 px-3 py-1 rounded-lg">SIZE: {item.size}</span>}
                          {item.color && <span className="bg-black/5 px-3 py-1 rounded-lg">COLOR: {item.color}</span>}
                          <span className="bg-black/5 px-3 py-1 rounded-lg">QTY: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-black/[0.02] p-8 border-t border-black/5">
                   <div className="flex justify-between items-center max-w-xs ml-auto">
                      <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Total Manifest Value</p>
                      <p className="text-3xl font-black text-black">${order.total.toFixed(2)}</p>
                   </div>
                </div>
              </div>
            </section>

            {/* Customer Entity */}
            <section className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Customer Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
                   <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white text-xl font-black">
                        {order.customerName[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-black">{order.customerName}</h4>
                        <p className="text-sm text-black/40 font-medium">Verified Identity</p>
                      </div>
                   </div>
                   <div className="space-y-4 pt-4 border-t border-black/5">
                      <div className="flex items-center space-x-3 group">
                        <Mail className="h-4 w-4 text-black/20 group-hover:text-black transition-colors" />
                        <span className="text-sm font-bold">{order.customerEmail}</span>
                      </div>
                      <div className="flex items-center space-x-3 group">
                        <Phone className="h-4 w-4 text-black/20 group-hover:text-black transition-colors" />
                        <span className="text-sm font-bold">{order.customerPhone}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
                  <div className="flex items-center justify-between">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-black/30">Delivery Node</h4>
                     <MapPin className="h-4 w-4 text-black/20" />
                  </div>
                  <div className="space-y-1 font-black text-black text-lg leading-tight uppercase tracking-tight">
                    <p>{order.shippingAddress?.address}</p>
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                    <p className="text-black/40 text-sm mt-4 font-black">{order.shippingAddress?.zipCode}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Action Control Deck */}
          <div className="space-y-12">
            <section className="space-y-6">
               <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Status Protocol</h2>
               <div className="bg-white rounded-[2.5rem] border border-black/5 p-8 shadow-[0_20px_40px_rgb(0,0,0,0.04)] space-y-4">
                 {[
                   { label: 'Process Dispatch', status: 'processing', icon: Package },
                   { label: 'Dispatch to Logistics', status: 'shipped', icon: Truck },
                   { label: 'Confirm Delivery', status: 'delivered', icon: CheckCircle },
                 ].map((action) => (
                   <Button 
                    key={action.status}
                    onClick={() => handleStatusUpdate(action.status as any)}
                    disabled={order.status === action.status}
                    className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all relative overflow-hidden group ${
                      order.status === action.status 
                        ? 'bg-black text-white' 
                        : 'bg-black/[0.03] text-black hover:bg-black hover:text-white'
                    }`}
                   >
                     <action.icon className="h-4 w-4 mr-3" />
                     {action.label}
                   </Button>
                 ))}
                 <Button 
                    onClick={() => handleStatusUpdate("cancelled")}
                    disabled={order.status === "cancelled"}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-none transition-all"
                  >
                    <XCircle className="h-4 w-4 mr-3" />
                    Void Manifest
                  </Button>
               </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Manifest Intelligence</h2>
              <div className="bg-white rounded-[2.5rem] border border-black/5 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Internal Notes</span>
                   {!isEditingNotes ? (
                     <button onClick={() => setIsEditingNotes(true)} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                       <Edit2 className="h-3.5 w-3.5" />
                     </button>
                   ) : (
                     <div className="flex gap-2">
                       <button onClick={handleNotesUpdate} className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors">
                         <Save className="h-3.5 w-3.5" />
                       </button>
                       <button onClick={() => setIsEditingNotes(false)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                         <X className="h-3.5 w-3.5" />
                       </button>
                     </div>
                   )}
                </div>
                {isEditingNotes ? (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-32 p-4 bg-black/[0.02] border-black/5 rounded-2xl font-medium text-sm focus:ring-0 resize-none"
                    placeholder="Enter audit notes..."
                  />
                ) : (
                  <p className="text-sm font-medium leading-relaxed text-black/60 italic">
                    {order.notes || "No audit notes recorded for this manifest."}
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Chronological Logs</h2>
              <div className="bg-white rounded-[2.5rem] border border-black/5 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <Activity className="h-24 w-24" />
                </div>
                <div className="space-y-6 relative z-10">
                   {[
                     { label: 'Manifest Initialized', date: order.createdAt?.toDate()?.toLocaleString(), active: true },
                     { label: 'Payment Node Verified', date: 'Authorized via System', active: order.status !== 'pending' },
                     { label: 'Logistics Handover', date: order.status === 'shipped' || order.status === 'delivered' ? 'In Transit' : 'Pending', active: order.status === 'shipped' || order.status === 'delivered' },
                     { label: 'Final Fulfillment', date: order.status === 'delivered' ? 'Completed' : 'Awaiting', active: order.status === 'delivered' },
                   ].map((log, i) => (
                     <div key={i} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                           <div className={`w-3 h-3 rounded-full border-2 transition-colors ${log.active ? 'bg-black border-black' : 'border-black/10'}`} />
                           {i < 3 && <div className={`w-[2px] flex-1 my-2 transition-colors ${log.active ? 'bg-black' : 'bg-black/5'}`} />}
                        </div>
                        <div>
                           <p className={`text-xs font-black uppercase tracking-widest ${log.active ? 'text-black' : 'text-black/20'}`}>{log.label}</p>
                           <p className="text-[10px] font-medium text-black/30 mt-1">{log.date}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
