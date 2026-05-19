import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { amount, orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "ORDER_ID_REQUIRED" }, { status: 400 });

    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    if (!tmnCode || !secretKey) {
        throw new Error("VNPAY Config is missing in .env");
    }

    const date = new Date();
    const createDate = date.toISOString().slice(0, 19).replace(/[-:T]/g, "");

    let vnp_Params: any = {
      'vnp_Version': '2.1.0',
      'vnp_Command': 'pay',
      'vnp_TmnCode': tmnCode,
      'vnp_Locale': 'vn',
      'vnp_CurrCode': 'VND',
      'vnp_TxnRef': orderId.toString(),
      'vnp_OrderInfo': 'Thanh toan cho don hang ' + orderId,
      'vnp_OrderType': 'other',
      'vnp_Amount': Math.floor(amount * 25000 * 100), 
      'vnp_ReturnUrl': returnUrl,
      'vnp_IpAddr': '127.0.0.1',
      'vnp_CreateDate': createDate,
    };

    vnp_Params = Object.keys(vnp_Params).sort().reduce((obj: any, key) => {
      obj[key] = vnp_Params[key];
      return obj;
    }, {});

    const signData = Object.keys(vnp_Params)
      .map((key) => {
        const val = vnp_Params[key];
        if (val === null || val === "") return "";
        return `${encodeURIComponent(key)}=${encodeURIComponent(val.toString())}`;
      })
      .filter(p => p !== "")
      .join("&")
      .replace(/%20/g, "+"); 

    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    
    const finalUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;

    console.log("--- SECURE PROTOCOL v2.1.0 GENERATED ---");
    return NextResponse.json({ paymentUrl: finalUrl });

  } catch (error: any) {
    console.error("VNPAY_API_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}