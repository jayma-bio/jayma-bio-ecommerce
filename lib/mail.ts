import { format } from "date-fns";
import { transporter } from "./nodemailer";

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendOrderPlacedMailtoUser = async ({
  email,
  name,
  items_name,
  date,
  orderId,
  paymentId,
  amount,
}: {
  email: string;
  name: string;
  items_name: string;
  date: string;
  orderId: string;
  amount: string;
  paymentId: string;
  storeId: string;
}) => {
  const info = await transporter.sendMail({
    from: `"Jayma Bio Innovations" <${process.env.GMAIL_EMAIL}>`,
    to: email,
    subject: `New Order: ${name}`,
    html: `<html dir="ltr" lang="en">

<head>
  <link rel="preload" as="image" href="https://utfs.io/f/aoQyAq6fictrObn6USip9naGtPDMNeS7jURlyO2zvkVfbAmH" />
  <link rel="preload" as="image" href="https://utfs.io/f/aoQyAq6fictrObn6USip9naGtPDMNeS7jURlyO2zvkVfbAmH" />
  <link rel="preload" as="image" href="https://utfs.io/f/aoQyAq6fictrObn6USip9naGtPDMNeS7jURlyO2zvkVfbAmH" />
  <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
</head>

<body
  style="background-color:#fff;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif">
  <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"
    style="max-width:37.5em">
    <tbody>
      <tr style="width:100%">
        <td>
          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"
            style="padding:30px 20px"></table>
          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"
            style="border:1px solid rgb(0,0,0, 0.1);border-radius:3px;overflow:hidden">
            <tbody>
              <tr>
                <td>
                  <img src="https://utfs.io/f/aoQyAq6fictrObn6USip9naGtPDMNeS7jURlyO2zvkVfbAmH" style="display:block;outline:none;border:none;text-decoration:none" width="620"/>
                  <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"
                    style="padding:30px 40px;">
                    <tbody style="width:100%">
                      <tr style="width:100%">
                        <td data-id="__react-email-column">
                          <h2 style="font-size:26px;font-weight:bold;text-align:left;margin-bottom:30px;">
                            Greetings, ${name}
                          </h2>
                          <h2 style="font-size:20px;font-weight:semibold;text-align:left;margin-bottom:30px;">
                            Your order has been placed successfully
                          </h2>
                          <h2 style="font-size:20px;font-weight:semibold;text-align:left;margin-bottom:30px;">
                            ${items_name}
                          </h2>
                          <p style="font-size:18px;line-height:24px;margin:20px 0;text-align:left;">
                            Paid Amount: ${amount}
                          </p>
                          <p style="font-size:18px;line-height:24px;margin:20px 0;text-align:left;">
                            Order Id: ${orderId}
                          </p>
                          <p style="font-size:18px;line-height:24px;margin:20px 0;text-align:left;">
                            Payment Id: ${paymentId}
                          </p>
                          <p style="font-size:18px;line-height:24px;margin:20px 0;text-align:left;">
                            Order Date: ${format(
                              new Date(date),
                              "EEEE, MMMM d, yyyy"
                            )}
                          </p>
                          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0"
                            role="presentation">
                            <tr>
                              <td align="center" style="padding: 30px 0;">
                                <a href="https://jaymabioinnovations.com/orders/${orderId}"
                                  style="background-color: #000000; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px;">
                                  View Order Details
                                </a>
                              </td>
                            </tr>
                          </table>
                          <p style="font-size:18px;line-height:24px;margin:16px 0;">Best regards,<br><a
                              href="https://jayma-bio.exions.tech/" target="_blank">Jayma Bio Innovations Pvt Ltd</a>
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"
            style="padding:45px 0 0 0">
            <tbody>
              <tr>
                <td><img src="https://korabi-ecommerce-admin.vercel.app/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdncmjp41z%2Fimage%2Fupload%2Fv1704195824%2Fpcgb9zsaecqlryiuwifi.png&amp;w=1920&amp;q=75" style="display:block;outline:none;border:none;text-decoration:none" width="620" />
                </td>
              </tr>
            </tbody>
          </table>
          <p style="font-size:12px;line-height:24px;margin:16px 0;text-align:center;color:rgb(0,0,0, 0.7)">© 2024 |
            <a href="https://jayma-bio.exions.tech/" target="_blank">Jayma Bio Innovations Pvt Ltd</a> developed by <a
              href="https://exions.tech" target="_blank">Exions Tech</a>
          </p>
        </td>
      </tr>
    </tbody>
  </table>
</body>

</html>`,
  });

  return info;
};

export const sendOrderPlacedMailtoAdmin = async ({
  name,
  items_name,
  date,
  orderId,
  paymentId,
  amount,
  storeId,
}: {
  name: string;
  items_name: string;
  date: string;
  orderId: string;
  amount: string;
  paymentId: string;
  storeId: string;
}) => {
  const info = await transporter.sendMail({
    from: `"Jayma Bio Innovations" <${process.env.GMAIL_EMAIL}>`,
    to: process.env.ADMIN_EMAIL!,
    subject: `New Order: ${name}`,
    html: `<html dir="ltr" lang="en">

<head>
  <link rel="preload" as="image" href="https://utfs.io/f/aoQyAq6fictrObn6USip9naGtPDMNeS7jURlyO2zvkVfbAmH" />
  <link rel="preload" as="image" href="https://utfs.io/f/aoQyAq6fictrObn6USip9naGtPDMNeS7jURlyO2zvkVfbAmH" />
  <link rel="preload" as="image" href="https://utfs.io/f/aoQyAq6fictrObn6USip9naGtPDMNeS7jURlyO2zvkVfbAmH" />
  <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
</head>

<body
  style="background-color:#fff;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif">
  <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"
    style="max-width:37.5em">
    <tbody>
      <tr style="width:100%">
        <td>
          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"
            style="padding:30px 20px"></table>
          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"
            style="border:1px solid rgb(0,0,0, 0.1);border-radius:3px;overflow:hidden">
            <tbody>
              <tr>
                <td>
                  <img src="https://utfs.io/f/aoQyAq6fictrObn6USip9naGtPDMNeS7jURlyO2zvkVfbAmH" style="display:block;outline:none;border:none;text-decoration:none" width="620"/>
                  <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"
                    style="padding:30px 40px;">
                    <tbody style="width:100%">
                      <tr style="width:100%">
                        <td data-id="__react-email-column">
                          <h2 style="font-size:26px;font-weight:bold;text-align:left;margin-bottom:30px;">
                            New Order Placed - ${orderId} by ${name}
                          </h2>
                          <h2 style="font-size:20px;font-weight:semibold;text-align:left;margin-bottom:30px;">
                            ${items_name}
                          </h2>
                          <p style="font-size:18px;line-height:24px;margin:20px 0;text-align:left;">
                            Paid Amount: ${amount}
                          </p>
                          <p style="font-size:18px;line-height:24px;margin:20px 0;text-align:left;">
                            Order Id: ${orderId}
                          </p>
                          <p style="font-size:18px;line-height:24px;margin:20px 0;text-align:left;">
                            Payment Id: ${paymentId}
                          </p>
                          <p style="font-size:18px;line-height:24px;margin:20px 0;text-align:left;">
                            Order Date: ${format(
                              new Date(date),
                              "EEEE, MMMM d, yyyy"
                            )}
                          </p>
                          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0"
                            role="presentation">
                            <tr>
                              <td align="center" style="padding: 30px 0;">
                                <a href="https://ecommerce.jaymabioinnovations.com/${storeId}/orders/${orderId}"
                                  style="background-color: #000000; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px;">
                                  View Order Details
                                </a>
                              </td>
                            </tr>
                          </table>
                          <p style="font-size:18px;line-height:24px;margin:16px 0;">Best regards,<br><a
                              href="https://jayma-bio.exions.tech/" target="_blank">Jayma Bio Innovations Pvt Ltd</a>
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation"
            style="padding:45px 0 0 0">
            <tbody>
              <tr>
                <td><img src="https://korabi-ecommerce-admin.vercel.app/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdncmjp41z%2Fimage%2Fupload%2Fv1704195824%2Fpcgb9zsaecqlryiuwifi.png&amp;w=1920&amp;q=75" style="display:block;outline:none;border:none;text-decoration:none" width="620" />
                </td>
              </tr>
            </tbody>
          </table>
          <p style="font-size:12px;line-height:24px;margin:16px 0;text-align:center;color:rgb(0,0,0, 0.7)">© 2024 |
            <a href="https://jayma-bio.exions.tech/" target="_blank">Jayma Bio Innovations Pvt Ltd</a> developed by <a
              href="https://exions.tech" target="_blank">Exions Tech</a>
          </p>
        </td>
      </tr>
    </tbody>
  </table>
</body>

</html>`,
  });

  return info;
};
