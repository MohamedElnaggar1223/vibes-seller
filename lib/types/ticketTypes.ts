export type TicketType = {
    country: string,
    createdAt: Date,
    eventId: string,
    id: string,
    parkingPass: number,
    seats: {},
    tickets: any,
    totalPaid: number,
    userId: string,
    status: 'pending' | 'paid'
    forSale?: boolean
    salePrice?: number | string
    saleStatus?: 'pending' | 'sold' | 'cancelled'
}

export type PromoCode = {
    country: string,
    createdAt: Date,
    discount: number,
    eventID: string,
    id: string,
    promo: string,
    quantity: number,
    quantityUsed: number,
    singleEvent: boolean,
    type: '$' | '%'
}