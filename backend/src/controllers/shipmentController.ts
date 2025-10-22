import { Request, Response } from 'express';

export const getShipments = async (req: Request, res: Response) => {
  try {
    const hardCodedShipments = [
      {
        _id: '60c72b965f1b2c001c8e4d51',
        productName: 'Vắc xin Covid-19',
        status: 'In Transit',
      },
      {
        _id: '60c72b965f1b2c001c8e4d52',
        productName: 'Thuốc kháng sinh',
        status: 'Delivered',
      },
      {
        _id: '60c72b965f1b2c001c8e4d53',
        productName: 'Thiết bị y tế',
        status: 'Pending',
      },
    ];

    res.status(200).send(JSON.stringify(hardCodedShipments, null, 2));

  } catch (error) {
    res.status(500).json({ message: 'Server Lỗi', error });
  }
};