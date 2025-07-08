const puppeteer = require('puppeteer');

async function testSmartHomepage() {
  const browser = await puppeteer.launch({ headless: false });
  
  try {
    // 测试1：清除localStorage，模拟首次访问
    console.log('测试1：首次访问www.timee.group');
    const page1 = await browser.newPage();
    await page1.evaluateOnNewDocument(() => {
      localStorage.clear();
    });
    await page1.goto('https://wmxkwzbmhflj.sealoshzh.site/');
    
    // 等待页面加载
    await page1.waitForTimeout(2000);
    
    // 检查是否显示使用手册
    const hasGuide = await page1.evaluate(() => {
      return document.querySelector('h1')?.textContent.includes('如何使用 Timee');
    });
    
    console.log('首次访问显示使用手册:', hasGuide);
    
    // 测试2：点击"立即创建活动"按钮
    console.log('\n测试2：点击"立即创建活动"按钮');
    const createButton = await page1.$('button:has-text("立即创建活动")');
    if (createButton) {
      await createButton.click();
      await page1.waitForTimeout(1000);
      
      // 检查是否切换到创建界面
      const hasCreateForm = await page1.evaluate(() => {
        return document.querySelector('h2')?.textContent.includes('Timee 设置');
      });
      
      console.log('切换到创建界面:', hasCreateForm);
    }
    
    // 测试3：点击"使用手册"按钮
    console.log('\n测试3：点击"使用手册"按钮');
    const guideButton = await page1.$('button:has-text("使用手册")');
    if (guideButton) {
      await guideButton.click();
      await page1.waitForTimeout(1000);
      
      // 检查是否切换回使用手册
      const backToGuide = await page1.evaluate(() => {
        return document.querySelector('h1')?.textContent.includes('如何使用 Timee');
      });
      
      console.log('切换回使用手册:', backToGuide);
    }
    
    // 测试4：新标签页访问（应该显示创建界面，因为localStorage已有访问记录）
    console.log('\n测试4：新标签页访问（已有访问记录）');
    const page2 = await browser.newPage();
    await page2.goto('https://wmxkwzbmhflj.sealoshzh.site/');
    await page2.waitForTimeout(2000);
    
    const hasCreateForm2 = await page2.evaluate(() => {
      return document.querySelector('h2')?.textContent.includes('Timee 设置');
    });
    
    console.log('再次访问显示创建界面:', hasCreateForm2);
    
    await page1.close();
    await page2.close();
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await browser.close();
  }
}

// 运行测试
testSmartHomepage().catch(console.error); 