import { Test, TestingModule } from '@nestjs/testing';
import { PdfConverterService } from './pdf-converter.service';

describe('PdfConverterService', () => {
  let service: PdfConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfConverterService],
    }).compile();

    service = module.get<PdfConverterService>(PdfConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
