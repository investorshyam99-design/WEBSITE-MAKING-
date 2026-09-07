const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `    } finally {
        setIsLoadingOrders(false);
    }

  const handleNextPage = () => {`,
  `    } finally {
        setIsLoadingOrders(false);
    }
  };

  const handleNextPage = () => {`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code, 'utf8');
