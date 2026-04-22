import { PageLayout } from '../components/common/PageLayout';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { FileUploadButton } from '../components/etf_monitor/FileUploadButton';
import { useETFAnalysis } from '../hooks/useETFAnalysis';
import { ConstituentsTable } from '../components/etf_monitor/ConstituentsTable';
import { ETFPriceChart } from '../components/etf_monitor/ETFPriceChart';
import { TopHoldingsBarChart } from '../components/etf_monitor/TopHoldingsBarChart';
import { ErrorAlert } from '../components/etf_monitor/ErrorAlert';

const ETFMonitorPage = () => {
  const isOnline = useHealthCheck();

  // etf analysis hook
  const { mutate: analyzeEtf, isPending, data, isError, error, reset } = useETFAnalysis();

    return (
      <PageLayout isOnline={isOnline}>
        <div className="mb-8 flex justify-between items-center border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ETF Price Monitor</h1>
            <p className="text-slate-500 text-sm">Historical prices and constituent analysis</p>
          </div>
          
          <FileUploadButton
            onFileSelect={analyzeEtf}
            isPending={isPending} 
          />
      </div>

      {isError && <ErrorAlert message={error?.message} onDismiss={reset} />}

      {/* main content */}
      <div className="space-y-8">
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">ETF Price History</h2>
          <div className="flex-1 w-full overflow-hidden">
            <ETFPriceChart chartData={data?.data?.reconstructed_history || {}} />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[650px] flex flex-col overflow-hidden">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Top 5 Holdings</h2>
            <div className="flex-1 w-full overflow-hidden">
              <TopHoldingsBarChart holdings={data?.data?.top_5_holdings || []} />
            </div>
          </section>

          <section className="lg:col-span-1 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[650px] flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Constituents Details</h2>
            <div className="flex-1 overflow-hidden">
              <ConstituentsTable list={data?.data?.all_constituents || []} />
            </div>
          </section>
        </div>
      </div>

      </PageLayout>
    );
};

export default ETFMonitorPage;