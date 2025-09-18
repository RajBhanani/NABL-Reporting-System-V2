import type { TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';

import { Box, Button, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { useEffect, useMemo, useState } from 'react';

import type { MetaData } from '../../../../types/metadata';
import type { ReportPopulated } from '../../../../types/reports';
import type { SamplePopulated } from '../../../../types/samples';

import { nablLogo } from '../../../../assets/nablLogo';
import { companyLogo } from '../../../../assets/sumitomoLogo';
import Loading from '../../../../components/Loading';
import { getMetaData } from '../../../../services/metadata.service';
import { getReportById } from '../../../../services/reports.service';
import { getSampleById } from '../../../../services/samples.service';

const GeneratePDF = ({ reportId }: { reportId: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfMake as any).addVirtualFileSystem(pdfFonts);

  const {
    data: report,
    isLoading: isReportLoading,
    isError: isReportError,
    isSuccess: isReportSuccess,
  } = useQuery({
    queryKey: ['reports', reportId],
    queryFn: () => getReportById(reportId),
  });

  const {
    data: sample,
    isLoading: isSampleLoading,
    isError: isSampleError,
  } = useQuery({
    queryKey: ['samplesPopulated', report?.sampleId._id],
    queryFn: () => getSampleById(report!.sampleId._id),
    enabled: isReportSuccess,
  });

  const {
    data: metadata,
    isLoading: isMetaDataLoading,
    isError: isMetaDataError,
  } = useQuery({
    queryKey: ['metadata'],
    queryFn: getMetaData,
  });

  const [pdf, setPdf] = useState<pdfMake.TCreatedPdf | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const mappedResults = useMemo(() => {
    if (!report) return [];
    return report.testResults
      .map((res) => ({
        name: res.parameter.name,
        unit: res.parameter.unit,
        result: res.value,
        testMethod: res.parameter.testMethod,
      }))
      .sort((A, B) => A.testMethod.localeCompare(B.testMethod));
  }, [isReportSuccess]);

  const buildReportTable = () => {
    const body: [TableCell, TableCell, TableCell, TableCell, TableCell][] = [
      [
        { text: 'Sr. No.', style: { bold: true } },
        { text: 'Parameter', style: { bold: true } },
        { text: 'Unit', style: { bold: true } },
        { text: 'Result', style: { bold: true } },
        { text: 'Test Method', style: { bold: true } },
      ],
    ];
    for (let i = 0; i < mappedResults.length; i++) {
      let sameTestCount = 0;
      let temp = i;
      while (
        temp + 1 < mappedResults.length &&
        mappedResults[temp].testMethod === mappedResults[temp + 1].testMethod
      ) {
        sameTestCount++;
        temp++;
      }
      body.push([
        i + 1,
        mappedResults[i].name,
        mappedResults[i].unit,
        mappedResults[i].result,
        { text: mappedResults[i].testMethod, rowSpan: sameTestCount + 1 },
      ]);
      for (let k = 0; k < sameTestCount; k++) {
        body.push([
          i + k + 2,
          mappedResults[i + k + 1].name,
          mappedResults[i + k + 1].unit,
          mappedResults[i + k + 1].result,
          '',
        ]);
      }
      i += sameTestCount;
    }
    return body;
  };

  const generateDocDefinition = (
    sample: SamplePopulated,
    report: ReportPopulated,
    metadata: MetaData
  ) => {
    const docDefinition = {
      watermark: { text: 'Demo sample, not official', opacity: 0.3 },
      content: [
        {
          columns: [
            {
              image: companyLogo,
              width: 120,
              marginTop: 21,
            },
            {
              text: [
                {
                  text: 'Soil Health Research Laboratory (SHRL)\n',
                  style: { bold: 'true' },
                },
                {
                  text: '(A Division of Sumitomo Chemical India Limited)\n',
                  style: { bold: 'true' },
                },
                '6/2 Ruvapari Road, Bhavnagar - 364005\n',
                'Phone No. (0278) 2212401 - 3',
              ],
              alignment: 'center',
              lineHeight: '1.3',
              fontSize: 10.5,
              width: 'auto',
              marginTop: 10,
            },
            report.parameterSet.isPartial
              ? [
                  {
                    image: nablLogo,
                    width: 60,
                    marginLeft: 10,
                  },
                  {
                    text: `TC-${metadata.currentCertificationNumber}`,
                    margin: [21, 7, 0, 0],
                  },
                ]
              : [],
          ],
          marginRight: 40,
          columnGap: 22,
        },
        {
          text: 'TEST REPORT',
          style: [
            {
              bold: true,
              alignment: 'center',
              decoration: 'underline',
              fontSize: 13,
            },
          ],
        },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                `Sample Code: ${sample.sampleCode}`,
                '',
                {
                  text: `Report Date: ${new Date().toLocaleDateString()}`,
                  style: 'center',
                },
              ],
            ],
          },
          marginTop: 10,
          marginBottom: 10,
        },
        {
          text: 'Sample Detail',
          style: {
            fontSize: 12,
            alignment: 'center',
          },
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                `Sample Receieved On: ${
                  new Date(sample.sampleReceivedOn).toLocaleDateString() || '--'
                }`,
                `ULR: ${report.ulr}`,
              ],
              [
                `* Sample Type: ${sample.sampleType.name}`,
                `* Name of Farmer/Customer: ${sample.customerName || '--'}`,
              ],
              [
                `* Sample Detail: ${sample.sampleDetails || '--'}`,
                `* Address: ${sample.customerAddress || '--'}`,
              ],
              [
                `* Parameter: ${Object.keys(report.testResults).length}`,
                `* Contact No.: ${sample.customerContactNo || '--'}`,
              ],
              [
                `* Requested by: ${sample.requestedBy || '--'}`,
                `* Farm Name: ${sample.customerFarmName || '--'}`,
              ],
              [
                `Sample Condition/Qty.: ${sample.sampleCondOrQty || '--'}`,
                `* Survey No.: ${sample.surveyNo || '--'}`,
              ],
              [
                `Date(s) of Analysis: ${new Date(
                  report.analysisStartedOn
                ).toLocaleDateString()} to ${new Date(
                  report.analysisEndedOn
                ).toLocaleDateString()}`,
                `* Previous Crop: ${sample.prevCrop || '--'}`,
              ],
              [
                `Sampling By: ${sample.samplingBy || '--'}`,
                `* Next Crop: ${sample.nextCrop || '--'}`,
              ],
            ],
          },
        },
        {
          table: {
            widths: [30, 100, 50, 75, '*'],
            body: buildReportTable(),
          },
          marginTop: 15,
          marginBottom: 15,
        },
        {
          text: [
            { text: 'Remarks: * ', bold: 'true' },
            'information provided by customer',
          ],
        },
        {
          text: 'Environmental Condition: Temperature 25° ± 2°C & Humidity 50 ± 20RH',
        },
        {
          columns: [
            {
              text: 'Analysed By',
              style: { bold: true },
              margin: [0, 20, 0, 0],
            },
            {
              text: 'Checked & Approved By',
              style: {
                width: '*',
                bold: true,
                alignment: 'center',
              },
              margin: [0, 20, 0, 0],
            },
          ],
        },
        {
          columns: [
            {
              text: `${metadata.analysedBy}`,
              style: {
                bold: true,
              },
              margin: [0, 40, 0, 0],
            },
            {
              text: `${metadata.approvedBy}`,
              style: {
                width: '*',
                bold: true,
                alignment: 'center',
              },
              margin: [0, 40, 0, 0],
            },
          ],
        },
        {
          columns: [
            { text: '(Chemist)' },
            {
              text: 'Quality Manager\n(Authorised Signatory)',
              width: '*',
              alignment: 'center',
            },
          ],
        },
        {
          text: 'This report is issued under the following terms and conditions:',
          style: {
            decoration: 'underline',
          },
          margin: [0, 10, 0, 0],
        },
        {
          text: '1. The Test Results relates only for the sample received through the customer.',
          marginTop: 3,
        },
        {
          text: '2. The Test Reports shall not be reproduced except in the full without written approval of laboratory.',
          marginTop: 3,
          marginBottom: 10,
        },
        {
          text: 'End of Test Report',
          alignment: 'center',
          marginTop: 10,
          marginBottom: 10,
        },
        {
          text: `${report.parameterSet.name}: ${metadata.currentRevision}`,
          marginTop: 10,
        },
      ],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10,
      },
      pageSize: 'A4',
    } as TDocumentDefinitions;
    return docDefinition;
  };

  useEffect(() => {
    if (!report || !sample || !metadata) return;
    setIsPdfLoading(true);
    setTimeout(() => {
      const pdf = pdfMake.createPdf(
        generateDocDefinition(sample, report, metadata)
      );
      setPdf(pdf);
      setIsPdfLoading(false);
    }, 0);
  }, [report, sample, metadata]);

  const handleOpen = () => {
    if (pdf === null) {
      return;
    }
    pdf.open();
  };

  const handleDownload = () => {
    if (pdf === null) {
      return;
    }
    pdf.download(`${sample?.sampleCode} ${report?.parameterSet.name}`);
  };

  if (isPdfLoading || isReportLoading || isSampleLoading || isMetaDataLoading)
    return <Loading />;

  if (isReportError || isSampleError || isMetaDataError)
    return (
      <Typography>
        Some error occured. Please try refreshing the page.
      </Typography>
    );

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        gap: '20px',
      }}
    >
      <Button onClick={handleOpen}>Open Report</Button>
      <Button onClick={handleDownload}>Download Report</Button>
    </Box>
  );
};

export default GeneratePDF;
