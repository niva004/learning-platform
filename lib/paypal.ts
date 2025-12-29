import paypal from '@paypal/checkout-server-sdk'

const clientId = process.env.PAYPAL_CLIENT_ID || ''
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ''
const mode = process.env.PAYPAL_MODE === 'production' ? 'production' : 'sandbox'

function paypalClient() {
  const environment =
    mode === 'production'
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret)

  return new paypal.core.PayPalHttpClient(environment)
}

export async function createPayPalOrder(
  amount: string,
  currency: string = 'PLN',
  returnUrl?: string,
  cancelUrl?: string
) {
  const request = new paypal.orders.OrdersCreateRequest()
  request.prefer('return=representation')
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const requestBody: any = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount,
        },
      },
    ],
  }

  // Add return URLs if provided
  if (returnUrl || cancelUrl) {
    requestBody.application_context = {
      return_url: returnUrl || `${appUrl}/payment/success`,
      cancel_url: cancelUrl || `${appUrl}/dashboard`,
    }
  }

  request.requestBody(requestBody)

  try {
    const order = await paypalClient().execute(request)
    return order.result
  } catch (error) {
    console.error('PayPal order creation error:', error)
    throw error
  }
}

export async function capturePayPalOrder(orderId: string) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId)
  request.requestBody({})

  try {
    const order = await paypalClient().execute(request)
    return order.result
  } catch (error) {
    console.error('PayPal order capture error:', error)
    throw error
  }
}

export async function getPayPalOrder(orderId: string) {
  const request = new paypal.orders.OrdersGetRequest(orderId)

  try {
    const order = await paypalClient().execute(request)
    return order.result
  } catch (error) {
    console.error('PayPal get order error:', error)
    throw error
  }
}

